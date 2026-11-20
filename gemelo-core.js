/* ─────────────────────────────────────────────────────────────────────────
   Núcleo del gemelo digital — Aeropéndulo invertido · JARAPIS LAB · 2026-2

   PLANTA (no lineal, un motor encendido a la vez, como en el montaje real)
     I·θ̈ = −b·θ̇ + K·sin θ + Lm·(F1 − F2) + τ_ext
     Empuje de cada motor:  F = a·Ve² + c·Ve,  Ve = máx(Vmotor − Vzm, 0)
     Dinámica motor-hélice: τm·Ḟ = F_ss − F
     Vmotor = V_AO / Kao  (el PWM del comparador escala 0–5 V de la AO a 0–3,5 V)
     Topes mecánicos en ±θtope (≈ 85°, casi horizontal) con rebote (coeficiente e).
     Convención: θ > 0 = la varilla se inclina a la DERECHA vista de frente.
                 El motor 1 empuja hacia θ > 0 y el motor 2 hacia θ < 0.

   CONTROL: traducción literal del Formula Node del VI "control aeropendulo
   Ismael.vi" (viernes 13-nov-2026). I-PD con antienrollamiento, derivada
   filtrada, inversión de la curva de empuje, zona muerta Voff, límite de
   ángulo de seguridad, modo manual, tarar e invertir sentido.
   ───────────────────────────────────────────────────────────────────────── */
(function (g) {
  const DEG = Math.PI / 180, RAD = 180 / Math.PI;

  const PLANTA = {
    I: 1.14e-3,     // kg·m²   inercia respecto al pivote (calculada con masas medidas)
    K: 0.0461,      // N·m/rad rigidez gravitacional (desestabiliza)
    b: 1e-4,        // N·m·s   fricción viscosa (provisional)
    Lm: 0.255,      // m       brazo pivote → eje de motores
    a: 6.83e-3,     // N/V²    curva de empuje medida (anemómetro)
    c: 8.19e-3,     // N/V
    tau: 0.10,      // s       retardo motor-hélice (provisional)
    Vzm: 0.5,       // V       zona muerta real del motor (provisional; el VI la compensa con Voff)
    Kao: 1.43,      // V AO por V de motor (5 V AO ≈ 3,5 V en el motor)
    tope: 85,       // °       topes: la varilla cae casi a la horizontal y reposa en la arista del tope (≈ 5° por el espesor)
    e: 0.25,        // coeficiente de rebote en el tope
    res: 0.045,     // °       resolución del encoder (2000 P/R en X4)
  };

  const VI = {        // valores por defecto del panel del VI
    ref: 0, Kp: 2.23, Ki: 0.28, Kd: 0.6, Voff: 0.5, Vmax: 5, angmax: 30,
    autom: 1, en: 1, inv: 0, sel: 1, Vman: 2, Ts: 0.01,
  };

  function empuje(V, p) { const v = Math.max(0, V - p.Vzm); return p.a * v * v + p.c * v; }

  /* Estado del controlador (registros de desplazamiento del VI) */
  function nuevoControl() { return { n: 0, th0: 0, I: 0, d: 0, thp: 0, tp: 0, tarar: 0, alto: 0 }; }

  /* Formula Node, línea por línea. raw en grados, tick en ms. */
  function formulaNode(raw, tick, s, v) {
    const a = 6.83e-3, c = 8.19e-3, Km = 0.0492, Kao = 1.43, k = Math.PI / 180;
    const o = {};
    let h = (tick - s.tp) / 1000;
    if (s.n === 0 || h <= 0 || h > 0.1) h = 0.01;
    let th0 = s.th0;
    if (s.n === 0 || s.tarar) th0 = raw;
    const thdeg = raw - th0, th = thdeg * k, r = v.ref * k;
    let d, I;
    if (s.n === 0 || s.tarar) { d = 0; I = 0; }
    else { d = 0.8 * s.d + 0.2 * (th - s.thp * k) / h; I = s.I; }
    const Vmot = v.Vmax / Kao;
    const umax = (a * Vmot * Vmot + c * Vmot) / (2 * Km);
    const err = r - th;
    const Itry = I + v.Ki * h * err;
    const ut = Itry - v.Kp * th - v.Kd * d;
    let u = Math.max(-umax, Math.min(umax, ut));
    if (u === ut) I = Itry;
    const F = 2 * Km * Math.abs(u);
    const Vm = (-c + Math.sqrt(c * c + 4 * a * F)) / (2 * a);
    let m1 = 0, m2 = 0, V = 0, seguridad = 0;
    if (v.autom) {
      if (Math.abs(u) > 0.01) { V = Math.min(v.Vmax, Kao * (Vm + v.Voff)); if (u > 0) m1 = 1; else m2 = 1; }
      if (v.inv) { const t = m1; m1 = m2; m2 = t; }
      if (Math.abs(err) > v.angmax * k) { V = 0; m1 = 0; m2 = 0; I = 0; seguridad = 1; }
    } else {
      I = 0; V = Math.min(v.Vmax, v.Vman);
      if (v.sel === 1) m1 = 1;
      if (v.sel === 2) m2 = 1;
    }
    if (!v.en || s.alto) { V = 0; m1 = 0; m2 = 0; I = 0; }
    if (m1 === 0 && m2 === 0) V = 0;
    s.th0 = th0; s.I = I; s.d = d; s.thp = thdeg; s.tp = tick; s.n++; s.tarar = 0;
    o.thdeg = thdeg; o.u = u; o.umax = umax; o.V = V; o.m1 = m1; o.m2 = m2;
    o.motor = m1 + 2 * m2; o.errdeg = v.ref - thdeg; o.seguridad = seguridad; o.F = F;
    return o;
  }

  /* Simulador en tiempo real: estado físico + controlador discreto */
  function crear(opts) {
    const p = Object.assign({}, PLANTA, (opts && opts.planta) || {});
    const v = Object.assign({}, VI, (opts && opts.vi) || {});
    const sim = {
      p, v, t: 0, th: 0, w: 0, F1: 0, F2: 0, ctl: nuevoControl(), out: null, nextCtl: 0,
      offset: 0, extTorque: 0, golpes: [], hold: null, ruido: 0, contacto: 0, pulsos: 0,
    };
    sim.out = { thdeg: 0, u: 0, V: 0, m1: 0, m2: 0, motor: 0, errdeg: 0, seguridad: 0, umax: 1 };

    sim.reset = function (thetaDeg, w) {
      sim.t = 0; sim.th = (thetaDeg || 0) * DEG; sim.w = w || 0; sim.F1 = sim.F2 = 0;
      sim.ctl = nuevoControl(); sim.nextCtl = 0; sim.golpes = []; sim.offset = 0; sim.contacto = 0;
      sim.ctl.n = 1; sim.ctl.th0 = 0; sim.ctl.thp = sim.th * RAD;   // encoder ya tarado con la varilla vertical
      sim.out = { thdeg: 0, u: 0, V: 0, m1: 0, m2: 0, motor: 0, errdeg: 0, seguridad: 0, umax: 1 };
    };
    /* lectura del encoder (grados, cuantizada a 0,045°) */
    sim.encoder = function () {
      let deg = sim.th * RAD + sim.offset;
      if (sim.ruido > 0) deg += sim.ruido * (Math.random() * 2 - 1);
      return Math.round(deg / p.res) * p.res;
    };
    sim.golpe = function (Nms) { sim.golpes.push({ t0: sim.t, dur: 0.02, tau: Nms / 0.02 }); };

    sim.step = function (dt) {
      // controlador discreto (periodo Ts)
      if (sim.t + 1e-12 >= sim.nextCtl) {
        sim.out = formulaNode(sim.encoder(), sim.t * 1000, sim.ctl, sim.v);
        sim.nextCtl += sim.v.Ts;
      }
      const Vmot = sim.out.V / p.Kao;
      const F1ss = sim.out.m1 ? empuje(Vmot, p) : 0;
      const F2ss = sim.out.m2 ? empuje(Vmot, p) : 0;
      sim.F1 += dt * (F1ss - sim.F1) / p.tau;
      sim.F2 += dt * (F2ss - sim.F2) / p.tau;
      let tq = p.Lm * (sim.F1 - sim.F2) + sim.extTorque;
      for (const gp of sim.golpes) if (sim.t >= gp.t0 && sim.t < gp.t0 + gp.dur) tq += gp.tau;
      if (sim.hold !== null) {                       // mano: resorte-amortiguador hacia el ángulo del puntero
        tq += 0.06 * (sim.hold * DEG - sim.th) - 0.004 * sim.w;
      }
      const acc = (-p.b * sim.w + p.K * Math.sin(sim.th) + tq) / p.I;
      sim.w += acc * dt; sim.th += sim.w * dt;
      const lim = p.tope * DEG;
      sim.contacto = 0;
      if (sim.th > lim) { sim.th = lim; if (sim.w > 0) sim.w = -p.e * sim.w; sim.contacto = 1; }
      if (sim.th < -lim) { sim.th = -lim; if (sim.w < 0) sim.w = -p.e * sim.w; sim.contacto = -1; }
      sim.t += dt;
      if (sim.golpes.length > 8) sim.golpes = sim.golpes.filter(gp => sim.t < gp.t0 + 1);
    };
    sim.torqueMax = function () { return p.Lm * empuje(sim.v.Vmax / p.Kao, p); };
    sim.anguloRecuperable = function () { const r = sim.torqueMax() / p.K; return r >= 1 ? 90 : Math.asin(r) * RAD; };
    return sim;
  }

  /* Corrida fuera de línea (para gráficas de resultados) */
  function correr({ T = 6, th0 = 2, vi = {}, planta = {}, golpes = [], dt = 0.0005, cada = 0.01 } = {}) {
    const s = crear({ vi, planta }); s.reset(th0);
    const filas = []; let next = 0; const gs = golpes.slice();
    while (s.t <= T + 1e-9) {
      while (gs.length && s.t >= gs[0][0]) { s.golpe(gs[0][1]); gs.shift(); }
      s.step(dt);
      if (s.t >= next) { filas.push({ t: s.t, th: s.th * RAD, u: s.out.u, V: s.out.V, motor: s.out.motor, F1: s.F1, F2: s.F2 }); next += cada; }
    }
    const max = Math.max(...filas.map(f => Math.abs(f.th)));
    return { filas, max };
  }

  /* ═══════════════════════════════════════════════════════════════════════
     VERSIÓN FINAL (17-nov-2026): planta caracterizada + Formula Node final
     Fuente: ENTREGA control aeropendulo Ismael (17-nov) y caracterizaciones.md
       · Torque de cada motor casi todo/nada: T = Tmax·(1 − e^(−V/Vs)),
         V = Voff + Kv·|u| antes de invertir el PWM. Con V = 0,25 → ≈ 20 mN·m,
         V ≥ 1 → 43–47 mN·m (ensayos de escalón). El izquierdo da ≈ 5 % más.
       · τm ≈ 0,03 s y retardo puro ≈ 0,01 s (0 a 0,02 s en los ensayos).
       · Topes en ≈ ±72°. line0 = motor derecho, line1 = motor izquierdo; cada uno
         sopla hacia afuera, así que el derecho empuja la varilla hacia θ < 0.
       · Lazo del VI final: Wait de 1 ms → 6,6 ms por ciclo (DAQ Assistant).
       · Turbulencia del aire: torque aleatorio filtrado (calibrado para que la
         prueba 8 dé ≈ 0,8° rms y la prueba 1 ≈ 2,6° rms, como en los registros).
     ═══════════════════════════════════════════════════════════════════════ */
  const PLANTA_REAL = {
    I: 1.14e-3, K: 0.0461, b: 2e-4,
    Tmax: 0.044,    // N·m  torque de un motor: T = Tmax·(1 − e^(−V/Vs)) + kL·V  → 23 mN·m a V = 0,25; 47 a V = 1,5; 57 a V = 5
    Vs: 0.35,       // V    (ajustado a los ensayos de escalón y a los dos swing up reales del 19-nov)
    asim: 1.05,     //      el motor izquierdo da ≈ 5 % más
    tau: 0.03,      // s    constante de tiempo motor-hélice medida (al acelerar)
    tauBaja: 0.03,  // s    al frenar: la hélice sin potencia se desacelera más lento (ver calibración con el swing up)
    kL: 0.0026,     // N·m/V pendiente extra a voltaje alto (el swing up usa V = 5)
    retardo: 0.01,  // s    retardo puro
    tope: 72, topeIzq: 70.7, topeDer: 69.85, e: 0.25, res: 0.05,   // ° topes medidos con el encoder (izq. −70,7°, der. +69,85°) · rebote · encoder
    ruido: 0.0025, tauRuido: 0.05,  // N·m · s  turbulencia
  };
  const VI_FINAL = {   // valores por defecto guardados en el VI final
    ref: 0, Kp: 2, Ki: 0.4, Kd: 0.9, Kv: 0.6, Voff: 0.2, Vmax: 5, angmax: 90, TauD: 0.005,
    autom: 1, en: 1, inv: 1, pinv: 1, Ts: 0.0066, sel: 1, Vman: 0.5,
    swing: 0, thcut: 45,   // MODO DE ARRANQUE: 0 vertical a mano, 1 swing up desde el tope izquierdo, 2 desde el derecho
  };
  /* Formula Node final, línea por línea (TauD = 0,005 en el VI; aquí es parámetro
     para poder simular también el derivativo viejo de ~40 ms). */
  function formulaNodeFinal(raw, tick, s, v) {
    const a = 6.83e-3, c = 8.19e-3, Km = 0.0492, Kao = 1.43, k = Math.PI / 180;
    let h = (tick - s.tp) / 1000;
    if (s.n === 0 || h <= 0 || h > 0.1) h = 0.01;
    let th0 = s.th0; if (s.n === 0 || s.tarar) th0 = raw;
    // swing up: el cero (vertical) se fija desde el tope medido con el encoder al dar Run
    const tope = v.swing === 2 ? 69.85 : -70.7;
    if (s.n === 0 && v.swing) th0 = raw - tope;
    const thdeg = raw - th0, th = thdeg * k, r = v.ref * k;
    let d, I;
    if (s.n === 0 || s.tarar) { d = 0; I = 0; }
    else { const ex = Math.exp(-h / v.TauD); d = ex * s.d + (1 - ex) * (th - s.thp * k) / h; I = s.I; }
    const Vmot = v.Vmax / Kao, umax = (a * Vmot * Vmot + c * Vmot) / (2 * Km);
    const err = r - th, Itry = I + v.Ki * h * err, ut = Itry - v.Kp * th - v.Kd * d;
    const u = Math.max(-umax, Math.min(umax, ut)); if (u === ut) I = Itry;
    let m1 = 0, m2 = 0, seguridad = 0, Vlin = 0;
    if (v.autom) {
      if (Math.abs(u) > 0.01) { if (u > 0) m1 = 1; else m2 = 1; }
      if (v.inv) { const t = m1; m1 = m2; m2 = t; }
      if (Math.abs(err) > v.angmax * k) { m1 = 0; m2 = 0; I = 0; seguridad = 1; }
      // actuador lineal V = Voff + Kv·|u|
      if (m1 || m2) Vlin = Math.min(v.Vmax, v.Voff + v.Kv * Math.abs(u));
    } else {
      I = 0;
      if (v.Vman > 0) { Vlin = Math.min(v.Vmax, v.Vman); if (v.sel === 1) m1 = 1; if (v.sel === 2) m2 = 1; }
    }
    if (!v.en || s.alto) { m1 = 0; m2 = 0; I = 0; }
    if (m1 === 0 && m2 === 0) Vlin = 0;
    // Swing up (19-nov): 0 sube con empuje máximo, 1 planea con motores apagados, 2 sostiene con el I-PD,
    // 3 no despegó del tope en 1,5 s (lado equivocado o motor sin fuerza): motores apagados hasta el próximo Run
    let est = s.n === 0 ? 0 : (s.est || 0);
    if (!v.swing) est = 2;
    if (v.swing && v.autom && v.en && !s.alto) {
      if (est === 0) { if (Math.abs(thdeg) <= v.thcut) est = 1; else { I = s.I + h; if (I > 1.5 && Math.abs(thdeg) > 55) est = 3; } }
      else if (est === 1) { if (Math.abs(thdeg) <= 12) { est = 2; I = 0; } else if (thdeg * d > 0 && Math.abs(d) > 0.05) est = 0; }
      else if (est === 2 && Math.abs(thdeg) > 35) { est = 0; I = 0; }
      if (est === 0) { m1 = 0; m2 = 0; if (thdeg < 0) m1 = 1; else m2 = 1; if (v.inv) { const t = m1; m1 = m2; m2 = t; } Vlin = v.Vmax; }
      if (est === 1 || est === 3) { Vlin = 0; m1 = 0; m2 = 0; I = 0; }
    }
    // PWM invertido: el circuito da más empuje con menos voltaje en la AO (AO = 5 − V)
    const AO = v.pinv && Vlin > 0 ? 5 - Vlin : Vlin;
    s.th0 = th0; s.I = I; s.d = d; s.thp = thdeg; s.tp = tick; s.n++; s.tarar = 0; s.est = est;
    return { thdeg, u, umax, V: Vlin, AO, m1, m2, motor: m1 + 2 * m2, errdeg: v.ref - thdeg, seguridad, est };
  }
  function mulberry(seed) { let x = seed >>> 0; return () => { x = (x + 0x6D2B79F5) >>> 0; let t = x; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  /* Simulador de la versión final. Td/Ti = torque del motor derecho/izquierdo [N·m]. */
  function crearReal(opts) {
    const p = Object.assign({}, PLANTA_REAL, (opts && opts.planta) || {});
    const v = Object.assign({}, VI_FINAL, (opts && opts.vi) || {});
    const rnd = mulberry((opts && opts.seed) || 1);
    const gauss = () => { let x = 0; while (!x) x = rnd(); return Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * rnd()); };
    const sim = { p, v, t: 0, th: 0, w: 0, Td: 0, Ti: 0, nz: 0, ctl: nuevoControl(), out: null, nextCtl: 0, cola: [], cmd: { m1: 0, m2: 0, AO: 0 }, golpes: [],
                  hold: null, contacto: 0, ruidoMed: 0, extTorque: 0 };
    /* reset(θ): encoder ya tarado en la vertical. reset(θ, {run:true}): se da Run con la varilla en θ, como en el VI
       (el cero queda donde esté la varilla, o desde el tope si hay swing up). Con v.swing la varilla arranca en su tope. */
    sim.reset = function (thetaDeg, o) {
      if (v.swing) thetaDeg = v.swing === 2 ? p.topeDer : -p.topeIzq;
      sim.t = 0; sim.th = (thetaDeg || 0) * DEG; sim.w = 0; sim.Td = sim.Ti = 0; sim.nz = 0; sim.contacto = 0;
      sim.ctl = nuevoControl();
      if (!(v.swing || (o && o.run))) { sim.ctl.n = 1; sim.ctl.th0 = 0; sim.ctl.thp = sim.th * RAD; sim.ctl.tp = -v.Ts * 1000; }
      sim.nextCtl = 0; sim.cola = []; sim.cmd = { m1: 0, m2: 0, AO: 0 }; sim.golpes = [];
      sim.out = { thdeg: 0, u: 0, V: 0, AO: 0, m1: 0, m2: 0, motor: 0, errdeg: 0, umax: 1, seguridad: 0 };
    };
    sim.golpe = function (Nms) { sim.golpes.push({ t0: sim.t, dur: 0.02, tau: Nms / 0.02 }); };
    /* lectura del encoder (grados, cuantizada) con ruido de medida opcional */
    sim.encoder = function () {
      let deg = sim.th * RAD;
      if (sim.ruidoMed > 0) deg += sim.ruidoMed * (rnd() * 2 - 1);
      return Math.round(deg / p.res) * p.res;
    };
    const Tss = Veff => Veff <= 0 ? 0 : p.Tmax * (1 - Math.exp(-Veff / p.Vs)) + p.kL * Veff;
    sim.step = function (dt) {
      if (sim.t + 1e-12 >= sim.nextCtl) {
        sim.out = formulaNodeFinal(sim.encoder(), sim.t * 1000, sim.ctl, v);
        sim.cola.push({ t: sim.t + p.retardo, m1: sim.out.m1, m2: sim.out.m2, AO: sim.out.AO });
        sim.nextCtl += v.Ts;
      }
      while (sim.cola.length && sim.cola[0].t <= sim.t) sim.cmd = sim.cola.shift();
      // el circuito real tiene el PWM invertido: el motor ve 5 − AO (por eso el VI manda AO = 5 − V)
      const Veff = 5 - sim.cmd.AO;
      const Tdss = sim.cmd.m1 ? Tss(Veff) : 0, Tiss = sim.cmd.m2 ? Tss(Veff) * p.asim : 0;
      sim.Td += dt * (Tdss - sim.Td) / (Tdss >= sim.Td ? p.tau : p.tauBaja); sim.Ti += dt * (Tiss - sim.Ti) / (Tiss >= sim.Ti ? p.tau : p.tauBaja);
      sim.nz += (dt / p.tauRuido) * (-sim.nz) + p.ruido * Math.sqrt(2 * dt / p.tauRuido) * gauss();
      let tq = sim.Ti - sim.Td + sim.nz + sim.extTorque;
      for (const gp of sim.golpes) if (sim.t >= gp.t0 && sim.t < gp.t0 + gp.dur) tq += gp.tau;
      if (sim.hold !== null) tq += 0.06 * (sim.hold * DEG - sim.th) - 0.004 * sim.w;   // mano: resorte-amortiguador
      sim.w += dt * (-p.b * sim.w + p.K * Math.sin(sim.th) + tq) / p.I; sim.th += sim.w * dt;
      const limD = (p.topeDer ?? p.tope) * DEG, limI = (p.topeIzq ?? p.tope) * DEG; sim.contacto = 0;
      if (sim.th > limD) { sim.th = limD; if (sim.w > 0) sim.w = -p.e * sim.w; sim.contacto = 1; }
      if (sim.th < -limI) { sim.th = -limI; if (sim.w < 0) sim.w = -p.e * sim.w; sim.contacto = -1; }
      sim.t += dt;
      if (sim.golpes.length > 8) sim.golpes = sim.golpes.filter(gp => sim.t < gp.t0 + 1);
    };
    /* torque máximo del motor más débil (derecho) con el Vmax del panel */
    sim.torqueMax = function () { return Tss(v.Vmax); };
    sim.anguloRecuperable = function () { const r = sim.torqueMax() / p.K; return r >= 1 ? 90 : Math.asin(r) * RAD; };
    sim.reset(0);
    return sim;
  }

  g.Gemelo = { PLANTA, VI, crear, correr, formulaNode, empuje, DEG, RAD,
               PLANTA_REAL, VI_FINAL, formulaNodeFinal, crearReal };
})(typeof window !== 'undefined' ? window : globalThis);
