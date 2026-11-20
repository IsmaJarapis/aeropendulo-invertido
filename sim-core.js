/* ─────────────────────────────────────────────────────────────
   AeroSim — núcleo del gemelo digital del aeropéndulo invertido
   Jarapis Lab · Proyecto Instrumental 1 · 2026-2

   Planta no lineal (dos motores, empuje diferencial):
     I·θ̈ = −b·θ̇ + K·sin θ + Km·Δu_f + τ_d(t)
     τm·Δu̇_f = Δu_sat − Δu_f            (actuador de primer orden)
   Control discreto I-PD (muestreo Ts, retención de orden cero):
     Δu = Ki·∫(θref − θm)dt − Kp·θm − Kd·θ̇m,f
   Medición: encoder incremental X4 (resolución 0,045°) + ruido opcional.
   ───────────────────────────────────────────────────────────── */
(function () {
  const DEG = Math.PI / 180;
  const RAD = 180 / Math.PI;

  /* Parámetros nominales (Informe de avance 2, 2026-2) */
  const NOMINAL = {
    I: 1.14e-3,      // kg·m²   inercia total respecto al pivote
    K: 0.0461,       // N·m/rad rigidez gravitacional (término desestabilizante)
    Lm: 0.255,       // m       brazo del empuje (pivote → eje de motores)
    kF: 0.0492,      // N/V     pendiente del empuje en u0 (49,2 mN/V)
    Km: 2 * 0.255 * 0.0492, // N·m/V = 2·Lm·kF ≈ 0,0251
    b: 1e-4,         // N·m·s/rad fricción viscosa (PROVISIONAL)
    tau: 0.10,       // s       constante de tiempo motor-hélice (PROVISIONAL)
    u0: 3.0,         // V       voltaje base de cada motor
    vmax: 3.5,       // V       voltaje máximo por motor (L298N con 5 V)
    k2: 6.83e-3,     // N/V²    ajuste cuadrático del empuje
    k1: 8.19e-3,     // N/V
    res: 0.045,      // °       resolución del encoder (2000 P/R en X4)
  };

  const PRESETS = {
    avance2: { label: 'Avance 2 (Kp = 2,23 · Ki = 0,28 · Kd = 0,38)', mode: 'ipd', Kp: 2.23, Ki: 0.28, Kd: 0.38 },
    explora: { label: 'Exploratorio de simulación (Kp = 3 · Ki = 1 · Kd = 1)', mode: 'ipd', Kp: 3.0, Ki: 1.0, Kd: 1.0 },
    soloP:   { label: 'Solo P (inestable)', mode: 'ipd', Kp: 2.5, Ki: 0, Kd: 0 },
    off:     { label: 'Sin control', mode: 'off', Kp: 0, Ki: 0, Kd: 0 },
  };

  /* Generador pseudoaleatorio reproducible (mulberry32) + Box–Muller */
  function rng(seed) {
    let a = seed >>> 0;
    const u = () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return () => {
      let x = 0, y = 0;
      while (x === 0) x = u();
      y = u();
      return Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y);
    };
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function thrust(v, p) { const u = Math.max(0, v); return p.k2 * u * u + p.k1 * u; }

  /* Simulación completa. Devuelve filas por muestra de control y métricas. */
  function simulate(opts) {
    const p = Object.assign({}, NOMINAL, opts);
    const Ts = p.Ts || 0.005;
    const T = p.T || 10;
    const nSub = Math.max(1, Math.ceil(Ts / 0.0005));
    const h = Ts / nSub;
    const duMax = Math.min(p.vmax - p.u0, p.u0);          // |Δu| ≤ 0,5 V con u0 = 3 V, Vmax = 3,5 V
    const stop = (p.stopDeg || 90) * DEG;
    const gauss = rng(p.seed || 7);
    const impulses = (p.impulses || []).filter(d => d && d.t >= 0 && d.amp);
    const tRef = p.tRef == null ? 1.0 : p.tRef;

    let th = (p.theta0 || 0) * DEG, om = 0, duf = 0;
    let integ = 0, dFilt = 0, thmPrev = null;
    let fallen = false, tFall = null;
    const rows = [];

    const dist = (t) => {
      let d = 0;
      for (const im of impulses) if (t >= im.t && t < im.t + (im.dur || 0.02)) d += im.amp;
      return d;
    };
    const f = (x, u, t) => {
      const [a, w, z] = x;
      return [w, (-p.b * w + p.K * Math.sin(a) + p.Km * z + dist(t)) / p.I, (u - z) / p.tau];
    };

    const nSteps = Math.round(T / Ts);
    for (let k = 0; k <= nSteps; k++) {
      const t = k * Ts;
      const ref = (t >= tRef ? (p.ref || 0) : 0) * DEG;

      /* Medición del encoder */
      let meas = th + (p.noise ? p.noise * DEG * gauss() : 0);
      if (p.quant !== false) { const q = p.res * DEG; meas = Math.round(meas / q) * q; }

      /* Derivada filtrada de la medida (filtro de primer orden Tf) */
      if (thmPrev === null) thmPrev = meas;
      const Tf = Math.max(0, p.Tf || 0);
      dFilt = (Tf * dFilt + (meas - thmPrev)) / (Tf + Ts);
      thmPrev = meas;

      /* Ley de control I-PD con antienrollamiento por integración condicional */
      let duCmd = 0, duSat = 0;
      if (p.mode !== 'off' && !fallen) {
        const e = ref - meas;
        const unsat = p.Ki * (integ + e * Ts) - p.Kp * meas - p.Kd * dFilt;
        const sat = clamp(unsat, -duMax, duMax);
        if (unsat === sat || Math.sign(e) !== Math.sign(unsat)) integ += e * Ts;
        duCmd = p.Ki * integ - p.Kp * meas - p.Kd * dFilt;
        duSat = clamp(duCmd, -duMax, duMax);
      }

      const v1 = p.u0 + duSat, v2 = p.u0 - duSat;
      rows.push({
        t, theta: th * RAD, meas: meas * RAD, ref: ref * RAD,
        du: duSat, duRaw: duCmd, duf, v1, v2,
        F1: thrust(v1, p), F2: thrust(v2, p), dist: dist(t),
      });
      if (k === nSteps) break;

      /* Integración RK4 de la planta durante un periodo de muestreo */
      let x = [th, om, duf];
      for (let s = 0; s < nSub; s++) {
        const ts = t + s * h;
        const k1 = f(x, duSat, ts);
        const k2 = f(x.map((v, i) => v + 0.5 * h * k1[i]), duSat, ts + h / 2);
        const k3 = f(x.map((v, i) => v + 0.5 * h * k2[i]), duSat, ts + h / 2);
        const k4 = f(x.map((v, i) => v + h * k3[i]), duSat, ts + h);
        x = x.map((v, i) => v + h * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) / 6);
        if (Math.abs(x[0]) >= stop) {
          x[0] = Math.sign(x[0]) * stop;
          if (x[1] * x[0] > 0) x[1] = 0;
          if (!fallen) { fallen = true; tFall = ts; }
        }
      }
      [th, om, duf] = x;
    }

    return { rows, params: p, metrics: metrics(rows, p, { fallen, tFall, duMax, tRef, impulses }) };
  }

  /* Métricas de desempeño */
  function metrics(rows, p, ctx) {
    const band = p.band || 0.1;    // banda de establecimiento [°]
    let maxAbs = 0, maxErr = 0, satCount = 0, maxDu = 0;
    rows.forEach(r => {
      maxAbs = Math.max(maxAbs, Math.abs(r.theta));
      maxErr = Math.max(maxErr, Math.abs(r.theta - r.ref));
      maxDu = Math.max(maxDu, Math.abs(r.du));
      if (Math.abs(r.duRaw) > ctx.duMax + 1e-9) satCount++;
    });

    const refDeg = p.ref || 0, th0 = p.theta0 || 0;
    let overshoot = null;
    if (Math.abs(refDeg) > 1e-9) {
      const s = Math.sign(refDeg);
      const peak = Math.max(...rows.filter(r => r.t >= ctx.tRef).map(r => s * r.theta));
      overshoot = Math.max(0, (peak - Math.abs(refDeg)) / Math.abs(refDeg) * 100);
    } else if (Math.abs(th0) > 1e-9) {
      const s = Math.sign(th0);
      const cross = Math.max(0, ...rows.map(r => -s * r.theta));
      overshoot = cross / Math.abs(th0) * 100;
    }

    let tSettle = 0;
    for (let i = rows.length - 1; i >= 0; i--) {
      if (Math.abs(rows[i].theta - rows[i].ref) > band) { tSettle = i === rows.length - 1 ? null : rows[i + 1].t; break; }
    }

    let maxAfterImpulse = null;
    if (ctx.impulses.length) {
      const t0 = Math.min(...ctx.impulses.map(d => d.t));
      maxAfterImpulse = Math.max(0, ...rows.filter(r => r.t >= t0).map(r => Math.abs(r.theta)));
    }

    return {
      maxAbs, maxErr, overshoot, tSettle, maxDu,
      satPct: 100 * satCount / rows.length,
      within2: !ctx.fallen && maxAbs <= 2.0,
      fallen: ctx.fallen, tFall: ctx.tFall, maxAfterImpulse, band,
    };
  }

  /* ── Raíces de polinomios (Durand–Kerner) ── */
  function roots(coeffs) {
    const a = coeffs.slice();
    while (a.length && Math.abs(a[0]) < 1e-18) a.shift();
    const n = a.length - 1;
    if (n < 1) return [];
    const c = a.map(v => v / a[0]);
    const mul = (x, y) => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]];
    const sub = (x, y) => [x[0] - y[0], x[1] - y[1]];
    const div = (x, y) => { const d = y[0] * y[0] + y[1] * y[1] || 1e-30; return [(x[0] * y[0] + x[1] * y[1]) / d, (x[1] * y[0] - x[0] * y[1]) / d]; };
    const R = 1 + Math.max(...c.slice(1).map(Math.abs));
    let z = Array.from({ length: n }, (_, k) => [R * Math.cos(2 * Math.PI * k / n + 0.4), R * Math.sin(2 * Math.PI * k / n + 0.4)]);
    const ev = (x) => { let r = [1, 0]; for (let i = 1; i <= n; i++) r = [r[0] * x[0] - r[1] * x[1] + c[i], r[0] * x[1] + r[1] * x[0]]; return r; };
    for (let it = 0; it < 500; it++) {
      let delta = 0;
      z = z.map((zi, i) => {
        let den = [1, 0];
        z.forEach((zj, j) => { if (j !== i) den = mul(den, sub(zi, zj)); });
        const nz = sub(zi, div(ev(zi), den));
        delta = Math.max(delta, Math.hypot(nz[0] - zi[0], nz[1] - zi[1]));
        return nz;
      });
      if (delta < 1e-12) break;
    }
    return z.map(([re, im]) => ({ re, im: Math.abs(im) < 1e-7 ? 0 : im })).sort((x, y) => y.re - x.re);
  }

  /* Polos en lazo abierto: (τm s + 1)(I s² + b s − K) */
  function openLoopPoles(p) {
    p = Object.assign({}, NOMINAL, p);
    return roots([p.I, p.b, -p.K]).concat([{ re: -1 / p.tau, im: 0 }]).sort((x, y) => y.re - x.re);
  }
  /* Polos en lazo cerrado con I-PD continuo (sin filtro, sin muestreo):
     τI s⁴ + (I+τb) s³ + (b − Kτ + Km Kd) s² + (Km Kp − K) s + Km Ki = 0 */
  function closedLoopPoles(p) {
    p = Object.assign({}, NOMINAL, p);
    if (p.mode === 'off') return openLoopPoles(p);
    if (!p.Ki) return roots([p.tau * p.I, p.I + p.tau * p.b, p.b - p.K * p.tau + p.Km * p.Kd, p.Km * p.Kp - p.K]);
    return roots([p.tau * p.I, p.I + p.tau * p.b, p.b - p.K * p.tau + p.Km * p.Kd, p.Km * p.Kp - p.K, p.Km * p.Ki]);
  }

  function fmtPole(z, d = 2) {
    const n = (v) => v.toFixed(d).replace('.', ',').replace('-', '−');
    if (z.im === 0) return n(z.re);
    return `${n(z.re)} ${z.im >= 0 ? '+' : '−'} j${Math.abs(z.im).toFixed(d).replace('.', ',')}`;
  }

  window.AeroSim = { NOMINAL, PRESETS, simulate, roots, openLoopPoles, closedLoopPoles, fmtPole, thrust, DEG, RAD };
})();
