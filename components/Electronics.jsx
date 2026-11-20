/* Electrónica: explicación interactiva de la cadena DAQ → comparador LM324 → PWM (invertido) → L298N → motores */
const ElectronicsSection = () => {
  const { useState, useEffect, useRef } = React;
  const [ao, setAo] = useState(4.5);
  const [motor, setMotor] = useState(2);
  const cv = useRef(null);
  // PWM invertido: la salida del LM324 queda en alto mientras la sierra supera a ao0 → ciclo útil = 1 − ao0/5
  const duty = Math.max(0, Math.min(1, 1 - ao / 5));
  const V = 5 - ao;                                                           // voltaje que pide el VI (AO = 5 − V)
  const tq = 0.047 * (1 - Math.exp(-V / 0.42)) * (motor === 2 ? 1.05 : 1);   // torque medido en los ensayos de escalón [N·m]

  useEffect(() => {
    let raf, t0 = performance.now();
    const draw = (now) => {
      const c = cv.current; if (!c) return;
      const d = window.devicePixelRatio || 1, w = c.clientWidth, h = c.clientHeight;
      if (c.width !== w * d) { c.width = w * d; c.height = h * d; }
      const g = c.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, w, h);
      const sh = ((now - t0) / 1000) * 40, per = Math.max(90, w / 6), L = 54;
      const top1 = 18, h1 = h * 0.46, top2 = top1 + h1 + 30, h2 = h - top2 - 22;
      const Y1 = v => top1 + h1 - (v / 5) * h1;
      g.font = '11px JetBrains Mono, monospace';
      // ejes
      g.strokeStyle = '#2a2a2a'; g.strokeRect(L, top1, w - L - 10, h1); g.strokeRect(L, top2, w - L - 10, h2);
      g.fillStyle = '#8a8a8a'; g.textAlign = 'right';
      [0, 2.5, 5].forEach(v => g.fillText(v.toString().replace('.', ','), L - 6, Y1(v) + 4));
      g.fillText('1', L - 6, top2 + 4); g.fillText('0', L - 6, top2 + h2 + 4);
      g.save(); g.translate(14, top1 + h1 / 2); g.rotate(-Math.PI / 2); g.textAlign = 'center'; g.fillText('entradas del LM324 [V]', 0, 0); g.restore();
      g.save(); g.translate(14, top2 + h2 / 2); g.rotate(-Math.PI / 2); g.textAlign = 'center'; g.fillText('PWM', 0, 0); g.restore();
      // sierra del generador
      g.strokeStyle = '#4aa3ff'; g.lineWidth = 2; g.beginPath();
      for (let x = L; x <= w - 10; x++) { const ph = (((x - L) + sh) % per) / per; const y = Y1(ph * 5); x === L ? g.moveTo(x, y) : (ph < 0.01 ? (g.lineTo(x, Y1(5)), g.lineTo(x, y)) : g.lineTo(x, y)); }
      g.stroke();
      // nivel de ao0
      g.strokeStyle = '#F46008'; g.lineWidth = 2; g.setLineDash([6, 4]); g.beginPath(); g.moveTo(L, Y1(ao)); g.lineTo(w - 10, Y1(ao)); g.stroke(); g.setLineDash([]);
      // PWM hacia el puente H: en alto mientras la sierra está por encima de ao0 (invertido)
      g.strokeStyle = '#3ddc84'; g.lineWidth = 2.2; g.beginPath();
      for (let x = L; x <= w - 10; x++) { const ph = (((x - L) + sh) % per) / per; const on = ph * 5 > ao; const y = on ? top2 + 4 : top2 + h2; x === L ? g.moveTo(x, y) : g.lineTo(x, y); }
      g.stroke();
      // promedio (ciclo útil)
      const ym = top2 + h2 - duty * (h2 - 4);
      g.strokeStyle = '#f2c230'; g.setLineDash([2, 3]); g.beginPath(); g.moveTo(L, ym); g.lineTo(w - 10, ym); g.stroke(); g.setLineDash([]);
      g.textAlign = 'left'; g.fillStyle = '#4aa3ff'; g.fillText('sierra del generador', L + 8, top1 + 14);
      g.fillStyle = '#F46008'; g.fillText('ao0 de la DAQ', L + 180, top1 + 14);
      g.fillStyle = '#3ddc84'; g.fillText('PWM al puente H (invertido)', L + 8, top2 - 8);
      g.fillStyle = '#f2c230'; g.fillText('ciclo útil', L + 230, top2 - 8);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [ao, duty]);

  const box = { background:'#0a0a0a', border:'1px solid #1a1a1a', padding:'18px 20px' };
  const lbl = { fontFamily:'var(--sans)', fontSize:15, fontWeight:700, color:'var(--white)', marginBottom:10 };
  const pill = (on) => ({ display:'inline-flex', alignItems:'center', justifyContent:'center', minWidth:34, padding:'2px 8px', borderRadius:4, fontFamily:'var(--mono)', fontSize:12, fontWeight:700, background: on ? '#1d3b2a' : '#1a1a1a', color: on ? '#3ddc84' : '#666', border:`1px solid ${on ? '#2f6b49' : '#2a2a2a'}` });
  const steps = [
    ['1', 'Generador de onda', 'Produce una sierra de 0 a 5 V a 100 Hz: sube en rampa y cae de golpe. Es el “reloj” del PWM. Con menos amplitud los motores no giraban.'],
    ['2', 'DAQ NI USB-6212', 'LabVIEW calcula V = Voff + Kv·|u| y escribe ao0 = 5 − V (0–5 V). Dos líneas digitales eligen el motor: line0 el derecho, line1 el izquierdo.'],
    ['3', 'Comparador LM324', 'Compara ao0 con la sierra. Como quedó cableado, el PWM sale invertido: ao0 = 0 V da el empuje máximo y 5 V el mínimo. No se tocó la electrónica: se compensa en el código.'],
    ['4', 'Puente H L298N', 'Por dentro tiene compuertas AND: un motor gira solo si su EN (PWM) y su línea digital están en alto a la vez. Se enciende un solo motor por vez.'],
    ['5', 'Motor + hélice', 'Casi todo/nada: aun al mínimo da 17–20 mN·m y satura en 44–47 mN·m desde ao0 ≈ 4 V, con τm ≈ 0,03 s. Cada motor sopla hacia afuera: el izquierdo empuja la varilla a la derecha.'],
    ['6', 'Encoder → DAQ', 'El encoder entrega los pulsos A y B al contador ctr0 (PFI8 y PFI10); LabVIEW los convierte en ángulo y cierra el lazo.'],
  ];

  return (
    <section id="electronica" className="s-pad" style={{ background:'var(--bg)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <SectionHead num="03" title="Electrónica">
          Una salida analógica de la DAQ fija la potencia y dos líneas digitales eligen el motor. Mueve el control para ver cómo ese voltaje se vuelve pulsos y después torque. El PWM quedó invertido en el circuito: menos voltaje en ao0 es más empuje, y el VI lo compensa.
        </SectionHead>

        <div className="reveal" style={{ display:'grid', gridTemplateColumns:'minmax(0,1.6fr) minmax(0,1fr)', gap:2 }} id="elec-grid">
          <div style={{ ...box, padding:'14px 14px 6px' }}>
            <canvas ref={cv} style={{ width:'100%', height:300, display:'block' }} aria-label="Sierra del generador, nivel de ao0 y PWM resultante"/>
          </div>
          <div style={box}>
            <div style={lbl}>Pruébalo</div>
            <label htmlFor="elec-ao" style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:600 }}>Voltaje en ao0 <span style={{ fontFamily:'var(--mono)', color:'var(--red)' }}>{ao.toFixed(2).replace('.', ',')} V</span></label>
            <input id="elec-ao" type="range" min="0" max="5" step="0.05" value={ao} onChange={e => setAo(+e.target.value)} style={{ width:'100%', accentColor:'#F46008', margin:'8px 0 14px' }}/>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Motor elegido por LabVIEW</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:16 }}>
              {[1, 2].map(m => (
                <button key={m} onClick={() => setMotor(m)} style={{ padding:'8px', borderRadius:6, cursor:'pointer', fontSize:12, border:`1px solid ${motor === m ? '#F46008' : '#2a2a2a'}`, background: motor === m ? '#23190f' : '#111', color:'#eee' }}>
                  {m === 1 ? 'Derecho · line0 (←)' : 'Izquierdo · line1 (→)'}
                </button>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:'8px 14px', fontSize:13, alignItems:'center' }}>
              <span style={{ color:'var(--g1)' }}>Ciclo útil</span><b style={{ fontFamily:'var(--mono)' }}>{(duty * 100).toFixed(0)} %</b>
              <span style={{ color:'var(--g1)' }}>Voltaje pedido V = 5 − ao0</span><b style={{ fontFamily:'var(--mono)' }}>{V.toFixed(2).replace('.', ',')} V</b>
              <span style={{ color:'var(--g1)' }}>Torque sobre el pivote</span><b style={{ fontFamily:'var(--mono)' }}>{(tq * 1000).toFixed(1).replace('.', ',')} mN·m {motor === 1 ? '←' : '→'}</b>
              <span style={{ color:'var(--g1)' }}>Gravedad a 5° (referencia)</span><b style={{ fontFamily:'var(--mono)' }}>4,0 mN·m</b>
            </div>
            <div style={{ marginTop:16, ...lbl }}>Lógica del L298N</div>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead><tr>{['', 'ENA/ENB', 'IN1 / IN3', 'Salida'].map(h => <th key={h} style={{ textAlign:'left', color:'#8a8a8a', fontWeight:500, padding:'4px 4px' }}>{h}</th>)}</tr></thead>
              <tbody>
                {[1, 2].map(m => (
                  <tr key={m}><td style={{ padding:'4px' }}>{m === 1 ? 'Der.' : 'Izq.'}</td><td><span style={pill(duty > 0)}>PWM</span></td><td><span style={pill(motor === m)}>{motor === m ? '1' : '0'}</span></td><td><span style={pill(motor === m && duty > 0)}>{motor === m && duty > 0 ? 'GIRA' : 'quieto'}</span></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="reveal g3" style={{ marginTop:2, gap:2 }}>
          {steps.map(([n, t, d]) => (
            <div key={n} style={{ ...box, display:'grid', gridTemplateColumns:'34px 1fr', gap:12 }}>
              <span style={{ fontFamily:"'Bebas Neue', var(--sans)", fontSize:34, color:'var(--red)', lineHeight:1 }}>{n}</span>
              <div><div style={{ fontWeight:700, fontSize:14, marginBottom:6 }}>{t}</div><div style={{ fontSize:13, color:'var(--g1)', lineHeight:1.6 }}>{d}</div></div>
            </div>
          ))}
        </div>

        <figure className="reveal fig-card" style={{ margin:'2px 0 0', background:'#0a0a0a', border:'1px solid #1a1a1a', overflowX:'auto' }}>
          <div style={{ background:'#fff', minWidth:760 }}>
            <img src="assets/diagramas/conexiones.svg" alt="Diagrama de conexiones: DAQ NI USB-6212, generador de onda, comparador LM324, puente H L298N, motores, fuente con LM2596 y encoder" style={{ display:'block', width:'100%' }}/>
          </div>
          <figcaption className="fig-cap">Conexiones verificadas en el laboratorio (DAQ “Dev10”; bornes de la USB-6212). Cada color es una señal y ninguna línea cruza a otra.</figcaption>
        </figure>
        <div className="reveal g3" style={{ marginTop:2 }}>
          <figure className="fig-card" style={{ margin:0 }}>
            <img src="assets/final/foto_caja_DAQ.jpg" alt="Caja de la DAQ con los bornes USB, entrada y salida analógica, +5 V, GND y bornes digitales de entrada y salida" loading="lazy"/>
            <figcaption className="fig-cap">La DAQ en su caja: USB al computador, entrada y salida analógica, +5 V y GND, y bornes digitales de entrada (con CH.A y CH.B para el encoder) y de salida.</figcaption>
          </figure>
          <figure className="fig-card" style={{ margin:0 }}>
            <img src="assets/final/foto_DAQ_terminales.jpg" alt="Conexiones en los bornes de la DAQ NI USB-6212" loading="lazy"/>
            <figcaption className="fig-cap">Conexiones en la DAQ: AO0 (12), AO GND (14), P0.0 (44), P0.1 (45), D GND (43/48), PFI8 (33) y PFI10 (35).</figcaption>
          </figure>
          <figure className="fig-card" style={{ margin:0 }}>
            <div style={{ background:'#fff' }}><img src="assets/final/circuito_proteus.png" alt="Simulación del circuito en Proteus, con un LM393 en lugar del LM324" loading="lazy"/></div>
            <figcaption className="fig-cap">Simulación en Proteus. Proteus no trae el LM324 que usamos en la baquela, así que ahí el comparador es un LM393; el resto del circuito es el mismo.</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
};

/* Diagrama de conexiones (SVG) */
const WiringDiagram = () => {
  const B = ({ x, y, w, h, t, s, c = '#F46008' }) => (
    <g><rect x={x} y={y} width={w} height={h} rx="8" fill="#121212" stroke={c} strokeWidth="1.6"/>
      <text x={x + 12} y={y + 22} fill="#f1efeb" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="700">{t}</text>
      {s && <text x={x + 12} y={y + 40} fill="#8a8a8a" fontFamily="JetBrains Mono, monospace" fontSize="10.5">{s}</text>}</g>
  );
  const W = ({ d, c = '#cfcfcf', dash }) => <path d={d} fill="none" stroke={c} strokeWidth="2" strokeDasharray={dash ? '5 4' : undefined}/>;
  const T = ({ x, y, t, c = '#a3a09b', a = 'start' }) => <text x={x} y={y} fill={c} fontFamily="JetBrains Mono, monospace" fontSize="10.5" textAnchor={a}>{t}</text>;
  return (
    <svg viewBox="0 0 1100 440" style={{ minWidth:820, width:'100%', display:'block' }} role="img" aria-label="Diagrama de conexiones del aeropéndulo">
      <rect width="1100" height="440" fill="#0a0a0a"/>
      <B x={30} y={40} w={200} h={210} t="DAQ NI USB-6212" s="Dev10 · USB al PC"/>
      <T x={40} y={110} t="ao0 (12) · 0–5 V"/><T x={40} y={140} t="port0/line0 (44)"/><T x={40} y={170} t="port0/line1 (45)"/>
      <T x={40} y={200} t="PFI8 (33) · ctr0 A"/><T x={40} y={225} t="PFI10 (35) · ctr0 B"/><T x={40} y={244} t="GND (14, 43)"/>
      <B x={300} y={300} w={190} h={90} t="Generador de onda" s="sierra 0–5 V · 100 Hz" c="#4aa3ff"/>
      <B x={330} y={60} w={170} h={110} t="Comparador LM324" s="ao0 vs. sierra"/>
      <T x={342} y={122} t="PWM invertido:"/><T x={342} y={138} t="ao0 0 V = máximo"/>
      <B x={600} y={40} w={210} h={230} t="Puente H L298N" s="compuertas AND internas"/>
      <T x={612} y={98} t="ENA ← PWM"/><T x={612} y={122} t="ENB ← PWM"/><T x={612} y={150} t="IN1 ← line0"/><T x={612} y={174} t="IN3 ← line1"/>
      <T x={612} y={198} t="IN2, IN4 → GND"/><T x={612} y={226} t="OUT1-2 → derecho"/><T x={612} y={248} t="OUT3-4 → izquierdo"/>
      <B x={890} y={40} w={180} h={80} t="Motor derecho" s="sopla → · varilla ←"/>
      <B x={890} y={170} w={180} h={80} t="Motor izquierdo" s="sopla ← · varilla →" c="#4aa3ff"/>
      <B x={600} y={320} w={210} h={80} t="Fuente 12 V + LM2596" s="buck de 12 a 5 V" c="#f2c230"/>
      <B x={890} y={310} w={180} h={100} t="Encoder YUMO" s="2000 P/R · A, B, +V, 0 V" c="#19b3a6"/>
      <W d="M230 106 H300 V100 H330" c="#F46008"/>
      <W d="M395 300 V200 H360 V170" c="#4aa3ff"/>
      <W d="M500 115 H550 V94 H600" c="#3ddc84"/><W d="M550 115 V118 H600" c="#3ddc84"/>
      <W d="M230 136 H270 V20 H580 V146 H600"/>
      <W d="M230 166 H282 V30 H570 V170 H600"/>
      <W d="M810 222 H850 V80 H890" c="#F46008"/>
      <W d="M810 244 H860 V210 H890" c="#4aa3ff"/>
      <W d="M705 320 V270" c="#f2c230"/>
      <W d="M890 345 H860 V420 H140 V196 H230" c="#f2c230"/>
      <W d="M890 365 H850 V430 H120 V221 H230" c="#19b3a6"/>
      <T x={520} y={88} t="PWM" c="#3ddc84"/><T x={250} y={98} t="ao0" c="#F46008"/>
      <T x={300} y={14} t="line0 → IN1 (motor derecho)"/><T x={300} y={44} t="line1 → IN3 (motor izquierdo)" />
      <T x={150} y={414} t="A → PFI8" c="#f2c230"/><T x={150} y={436} t="B → PFI10" c="#19b3a6"/>
    </svg>
  );
};
Object.assign(window, { ElectronicsSection, WiringDiagram });
