/* 07 — Resultados reales de la planta (17-nov-2026) y validación del gemelo contra los registros */
const ResultsSection = () => {
  const { useState, useEffect, useMemo } = React;
  const [E, setE] = useState(null);        // ensayos.json: 8 pruebas de lazo + ensayos de escalón
  const [H, setH] = useState(null);        // historial.json: 42 intentos
  const [cmp, setCmp] = useState(1);       // prueba que se compara con la 8
  const [hov, setHov] = useState(null);    // intento bajo el puntero
  const [SW, setSW] = useState(null);      // swingup.json: los dos swing up reales y el gemelo
  const [lado, setLado] = useState('izq');
  useEffect(() => {
    fetch('assets/final/ensayos.json').then(r => r.json()).then(setE).catch(() => {});
    fetch('assets/final/historial.json').then(r => r.json()).then(setH).catch(() => {});
    fetch('assets/final/swingup.json').then(r => r.json()).then(setSW).catch(() => {});
  }, []);
  const fmt = (v, d = 2) => (v == null ? '—' : (+v).toFixed(d).replace('.', ',').replace('-', '−'));

  // el gemelo corre las mismas 8 pruebas (lazo de 2 ms, 15 s, métricas después de 3 s)
  const gemelo = useMemo(() => {
    if (!E || !window.Gemelo || !window.Gemelo.crearReal) return {};
    const o = {};
    for (const p of E.pruebas) {
      // promedio de 5 corridas con distinta turbulencia, como repetir el ensayo
      let rms = 0, pct = 0;
      for (const seed of [11, 12, 13, 14, 15]) {
        const s = window.Gemelo.crearReal({ vi: { Kp: p.p.Kp, Ki: 0.4, Kd: p.p.Kd, Kv: p.p.Kv, TauD: p.p.TauD, Ts: 0.002 }, seed });
        s.reset(2); let n = 0, sq = 0, dentro = 0, next = 3;
        while (s.t < 15) { s.step(0.0005); if (s.t >= next) { const th = s.th * 180 / Math.PI; sq += th * th; if (Math.abs(th) <= 2) dentro++; n++; next += 0.002; } }
        rms += Math.sqrt(sq / n) / 5; pct += 100 * dentro / n / 5;
      }
      o[p.n] = { rms, pct };
    }
    return o;
  }, [E]);

  const box = { background:'#0a0a0a', border:'1px solid #1a1a1a' };
  const lbl = { fontFamily:'var(--sans)', fontSize:17, fontWeight:700, color:'var(--white)' };
  const T = ({ x, y, t, a = 'middle', c = '#8a8a8a', s = 11 }) => <text x={x} y={y} fill={c} fontSize={s} fontFamily="JetBrains Mono, monospace" textAnchor={a}>{t}</text>;

  /* ── θ(t) real: prueba elegida contra la prueba 8 ── */
  const Antes = () => {
    if (!E) return null;
    const W = 860, Hh = 300, L = 48, R = 14, Tp = 14, B = 36, pw = W - L - R, ph = Hh - Tp - B, t0 = 3, t1 = 15, ym = 11;
    const X = t => L + (t - t0) / (t1 - t0) * pw, Y = v => Tp + ph / 2 - Math.max(-ym, Math.min(ym, v)) / ym * ph / 2;
    const line = (p, c, w) => <polyline fill="none" stroke={c} strokeWidth={w} points={p.t.map((t, i) => t >= t0 ? `${X(t).toFixed(1)},${Y(p.th[i]).toFixed(1)}` : '').filter(Boolean).join(' ')}/>;
    const a = E.pruebas.find(p => p.n === cmp), b = E.pruebas.find(p => p.n === 8);
    return (
      <svg viewBox={`0 0 ${W} ${Hh}`} width="100%" role="img" aria-label={`Ángulo medido en la prueba ${cmp} y en la prueba 8`}>
        <rect x={L} y={Y(2)} width={pw} height={Y(-2) - Y(2)} fill="rgba(25,179,166,.15)"/>
        {[-10, -5, -2, 0, 2, 5, 10].map(v => <g key={v}><line x1={L} x2={L + pw} y1={Y(v)} y2={Y(v)} stroke="#1c1c1c"/><T x={L - 6} y={Y(v) + 4} t={String(v).replace('-', '−')} a="end"/></g>)}
        {[3, 5, 7, 9, 11, 13, 15].map(t => <T key={t} x={X(t)} y={Tp + ph + 16} t={t}/>)}
        <T x={L + pw / 2} y={Hh - 4} t="tiempo [s] (registro del programa de 2 ms; se descartan los 3 s del arranque)" c="#a3a09b"/>
        <text transform={`translate(13 ${Tp + ph / 2}) rotate(-90)`} fill="#a3a09b" fontSize="11" fontFamily="Inter, sans-serif" textAnchor="middle">ángulo θ [°]</text>
        <rect x={L} y={Tp} width={pw} height={ph} fill="none" stroke="#2a2a2a"/>
        {line(a, '#8a8a8a', 1.4)}{line(b, '#F46008', 2)}
        <g transform={`translate(${L + 10} ${Tp + 10})`}>
          <rect width="300" height="42" fill="rgba(10,10,10,.85)" stroke="#222"/>
          <rect x="10" y="12" width="14" height="3" fill="#8a8a8a"/><T x={30} y={17} t={`prueba ${cmp} · rms ${fmt(a.rms)}° · ${a.pct} % en ±2°`} a="start" c="#c9c6c1"/>
          <rect x="10" y="29" width="14" height="3" fill="#F46008"/><T x={30} y={34} t={`prueba 8 · rms ${fmt(b.rms)}° · ${b.pct} % en ±2°`} a="start" c="#f1efeb"/>
        </g>
      </svg>
    );
  };

  /* ── swing up: planta contra gemelo ── */
  const Swing = () => {
    if (!SW) return null;
    const c = SW[lado], W = 860, Hh = 300, L = 48, R = 14, Tp = 14, B = 36, pw = W - L - R, ph = Hh - Tp - B, t1 = 4, y0 = -80, y1 = 80;
    const X = t => L + t / t1 * pw, Y = v => Tp + (y1 - Math.max(y0, Math.min(y1, v))) / (y1 - y0) * ph;
    const line = (arr, col, w, dash) => <polyline fill="none" stroke={col} strokeWidth={w} strokeDasharray={dash} strokeLinejoin="round" points={arr.map(r => `${X(r[0]).toFixed(1)},${Y(r[1]).toFixed(1)}`).join(' ')}/>;
    // tramos de la máquina de estados en el registro real
    const tramos = []; let ini = 0;
    for (let i = 1; i <= c.real.length; i++) if (i === c.real.length || c.real[i][2] !== c.real[i - 1][2]) { tramos.push([c.real[ini][0], c.real[i - 1][0], c.real[ini][2]]); ini = i; }
    const colE = ['rgba(244,96,8,.10)', 'rgba(74,158,255,.10)', 'transparent', 'rgba(255,77,77,.12)'];
    return (
      <svg viewBox={`0 0 ${W} ${Hh}`} width="100%" role="img" aria-label={`Swing up desde el tope ${lado === 'izq' ? 'izquierdo' : 'derecho'}: planta real contra el gemelo`}>
        {tramos.map(([a, b, e], i) => <rect key={i} x={X(a)} y={Tp} width={Math.max(0, X(b) - X(a))} height={ph} fill={colE[e] || 'transparent'}/>)}
        <rect x={L} y={Y(2)} width={pw} height={Y(-2) - Y(2)} fill="rgba(25,179,166,.18)"/>
        {[-70, -45, 0, 45, 70].map(v => <g key={v}><line x1={L} x2={L + pw} y1={Y(v)} y2={Y(v)} stroke="#1c1c1c"/><T x={L - 6} y={Y(v) + 4} t={String(v).replace('-', '−')} a="end"/></g>)}
        {[0, 1, 2, 3, 4].map(t => <T key={t} x={X(t)} y={Tp + ph + 16} t={t}/>)}
        <T x={L + pw / 2} y={Hh - 4} t="tiempo desde Run [s]" c="#a3a09b"/>
        <text transform={`translate(13 ${Tp + ph / 2}) rotate(-90)`} fill="#a3a09b" fontSize="11" fontFamily="Inter, sans-serif" textAnchor="middle">ángulo θ [°]</text>
        <rect x={L} y={Tp} width={pw} height={ph} fill="none" stroke="#2a2a2a"/>
        {line(c.gemelo, '#4A9EFF', 1.8, '6 5')}{line(c.real, '#F46008', 2.2)}
        <g transform={`translate(${L + pw - 330} ${Tp + (lado === 'izq' ? ph - 60 : 10)})`}>
          <rect width="320" height="50" fill="rgba(10,10,10,.88)" stroke="#222"/>
          <rect x="10" y="14" width="14" height="3" fill="#F46008"/><T x={30} y={19} t={`planta · atrapa a los ${fmt(c.atrapa.real)} s · rms ${fmt(c.metr.real.rms)}°`} a="start" c="#f1efeb"/>
          <line x1="10" x2="24" y1="35" y2="35" stroke="#4A9EFF" strokeWidth="2" strokeDasharray="4 3"/><T x={30} y={39} t={`gemelo · atrapa a los ${fmt(c.atrapa.gemelo)} s · rms ${fmt(c.metr.gemelo.rms)}°`} a="start" c="#c9c6c1"/>
        </g>
      </svg>
    );
  };

  /* ── barras: rms real vs gemelo, y % dentro de ±2° ── */
  const Barras = () => {
    if (!E) return null;
    const W = 860, Hh = 250, L = 44, R = 44, Tp = 16, B = 44, pw = W - L - R, ph = Hh - Tp - B, n = E.pruebas.length, bw = pw / n;
    const Y = v => Tp + ph - Math.min(6, v) / 6 * ph, Yp = v => Tp + ph - v / 100 * ph;
    return (
      <svg viewBox={`0 0 ${W} ${Hh}`} width="100%" role="img" aria-label="Error rms real y del gemelo, y porcentaje dentro de ±2°, en las 8 pruebas">
        {[0, 2, 4, 6].map(v => <g key={v}><line x1={L} x2={L + pw} y1={Y(v)} y2={Y(v)} stroke="#1c1c1c"/><T x={L - 6} y={Y(v) + 4} t={v} a="end"/></g>)}
        {[0, 50, 100].map(v => <T key={v} x={L + pw + 6} y={Yp(v) + 4} t={v + ' %'} a="start" c="#19b3a6"/>)}
        {E.pruebas.map((p, i) => { const x = L + i * bw, g = gemelo[p.n]; return (
          <g key={p.n}>
            <rect x={x + bw * 0.18} y={Y(p.rms)} width={bw * 0.3} height={Tp + ph - Y(p.rms)} fill={p.n === 8 ? '#F46008' : '#5a5a5a'}/>
            {g && <rect x={x + bw * 0.5} y={Y(g.rms)} width={bw * 0.3} height={Tp + ph - Y(g.rms)} fill="none" stroke="#4A9EFF" strokeWidth="1.5" strokeDasharray="3 2"/>}
            <T x={x + bw * 0.33} y={Y(p.rms) - 5} t={fmt(p.rms)} c={p.n === 8 ? '#F46008' : '#a3a09b'} s={10}/>
            <T x={x + bw / 2} y={Tp + ph + 15} t={'P' + p.n}/>
          </g>); })}
        <polyline fill="none" stroke="#19b3a6" strokeWidth="2" points={E.pruebas.map((p, i) => `${L + (i + 0.5) * bw},${Yp(p.pct)}`).join(' ')}/>
        {E.pruebas.map((p, i) => <circle key={p.n} cx={L + (i + 0.5) * bw} cy={Yp(p.pct)} r="3.5" fill="#19b3a6"/>)}
        <rect x={L} y={Tp} width={pw} height={ph} fill="none" stroke="#2a2a2a"/>
        <g transform={`translate(${L} ${Hh - 12})`}>
          <rect width="12" height="8" y="-7" fill="#5a5a5a"/><T x={18} y={0} t="rms real [°]" a="start"/>
          <rect x="120" width="12" height="8" y="-7" fill="none" stroke="#4A9EFF" strokeDasharray="3 2"/><T x={138} y={0} t="rms del gemelo [°]" a="start"/>
          <line x1="290" x2="304" y1="-3" y2="-3" stroke="#19b3a6" strokeWidth="2"/><T x={310} y={0} t="% del tiempo dentro de ±2° (real)" a="start" c="#19b3a6"/>
        </g>
      </svg>
    );
  };

  /* ── los 42 intentos reales ── */
  const COLF = { B:'#8a8a8a', C:'#E5B000', D:'#4A9EFF', E:'#c77dff', F:'#3ddc84', G:'#F46008' };
  const Intentos = () => {
    if (!H) return null;
    const W = 860, Hh = 300, L = 44, R = 14, Tp = 14, B = 34, pw = W - L - R, ph = Hh - Tp - B, ymax = 50;
    const X = i => L + (i - 0.5) / 42 * pw, Y = v => Tp + ph - Math.min(ymax, v) / ymax * ph;
    let best = Infinity; const env = H.intentos.map(o => { if (!o.cayo && o.err != null) best = Math.min(best, o.err); return [o.i, best]; });
    return (
      <svg viewBox={`0 0 ${W} ${Hh}`} width="100%" role="img" aria-label="Error máximo de la varilla en cada uno de los 42 intentos" onMouseLeave={() => setHov(null)}>
        {[0, 10, 20, 30, 40, 50].map(v => <g key={v}><line x1={L} x2={L + pw} y1={Y(v)} y2={Y(v)} stroke="#1c1c1c"/><T x={L - 6} y={Y(v) + 4} t={v} a="end"/></g>)}
        <line x1={L} x2={L + pw} y1={Y(2)} y2={Y(2)} stroke="#19b3a6" strokeDasharray="5 4"/>
        <T x={L + pw - 4} y={Y(2) - 5} t="objetivo ±2°" a="end" c="#19b3a6"/>
        {[1, 10, 20, 30, 42].map(i => <T key={i} x={X(i)} y={Tp + ph + 16} t={i}/>)}
        <T x={L + pw / 2} y={Hh - 2} t="intento" c="#a3a09b"/>
        <polyline fill="none" stroke="#f1efeb" strokeWidth="1.4" points={env.filter(e => isFinite(e[1])).map(([i, v]) => `${X(i)},${Y(v)}`).join(' ')}/>
        {H.intentos.map(o => {
          const x = X(o.i), y = o.cayo ? Y(47) : Y(o.err), c = COLF[o.fase] || '#888', on = hov === o.i;
          return (
            <g key={o.i} onMouseEnter={() => setHov(o.i)} onClick={() => setHov(o.i)} style={{ cursor:'pointer' }}>
              <rect x={x - pw / 84} y={Tp} width={pw / 42} height={ph} fill={on ? 'rgba(255,255,255,.05)' : 'transparent'}/>
              {o.cayo ? <path d={`M${x - 5} ${y - 5} L${x + 5} ${y + 5} M${x + 5} ${y - 5} L${x - 5} ${y + 5}`} stroke={c} strokeWidth="2.4"/>
                      : <circle cx={x} cy={y} r={on ? 6 : 4.5} fill={c} stroke={on ? '#fff' : 'none'}/>}
            </g>);
        })}
        <rect x={L} y={Tp} width={pw} height={ph} fill="none" stroke="#2a2a2a"/>
      </svg>
    );
  };
  const hi = H && hov ? H.intentos.find(o => o.i === hov) : null;

  /* ── ensayos de escalón: subida desde el tope ── */
  const Escalones = () => {
    if (!E) return null;
    const W = 860, Hh = 260, L = 48, R = 150, Tp = 14, B = 34, pw = W - L - R, ph = Hh - Tp - B, ymax = 45;
    const X = t => L + t / 2.5 * pw, Y = v => Tp + ph - Math.min(ymax, v) / ymax * ph;
    const cols = { 'izquierdo_AO2.5V':'#F46008', 'izquierdo_AO3.0V':'#ff8a3d', 'izquierdo_AO3.5V':'#ffc49a', 'derecho_AO2.5V':'#4A9EFF', 'derecho_AO3.0V':'#7fbaff', 'derecho_AO3.5V':'#b9d9ff' };
    const ens = E.escalones.filter(e => e.nombre.startsWith('escalon'));
    return (
      <svg viewBox={`0 0 ${W} ${Hh}`} width="100%" role="img" aria-label="Subida de la varilla desde el tope en los ensayos de escalón de cada motor">
        {[0, 10, 20, 30, 40].map(v => <g key={v}><line x1={L} x2={L + pw} y1={Y(v)} y2={Y(v)} stroke="#1c1c1c"/><T x={L - 6} y={Y(v) + 4} t={v} a="end"/></g>)}
        {[0, 0.5, 1, 1.5, 2, 2.5].map(t => <T key={t} x={X(t)} y={Tp + ph + 16} t={String(t).replace('.', ',')}/>)}
        <T x={L + pw / 2} y={Hh - 2} t="tiempo [s] · motor encendido 0,6 s con la varilla apoyada en el tope" c="#a3a09b"/>
        <text transform={`translate(13 ${Tp + ph / 2}) rotate(-90)`} fill="#a3a09b" fontSize="11" fontFamily="Inter, sans-serif" textAnchor="middle">subida desde el tope [°]</text>
        {ens.map(e => { const k = e.nombre.replace('escalon_motor_', ''); const on0 = e.t[e.on.indexOf(1)] || 0;
          return <polyline key={k} fill="none" stroke={cols[k] || '#888'} strokeWidth="1.8" points={e.t.map((t, i) => t - on0 + 0.2 >= 0 && t - on0 + 0.2 <= 2.5 ? `${X(t - on0 + 0.2).toFixed(1)},${Y(Math.abs(e.ang[i])).toFixed(1)}` : '').filter(Boolean).join(' ')}/>; })}
        <rect x={X(0.2)} y={Tp} width={X(0.8) - X(0.2)} height={ph} fill="rgba(244,96,8,.06)"/>
        <rect x={L} y={Tp} width={pw} height={ph} fill="none" stroke="#2a2a2a"/>
        {Object.entries(cols).map(([k, c], j) => <g key={k} transform={`translate(${L + pw + 14} ${Tp + 12 + j * 20})`}><rect width="12" height="3" y="-4" fill={c}/><T x={18} y={0} t={k.replace('_AO', ' · AO ').replace('V', ' V').replace('.', ',')} a="start" c="#c9c6c1" s={10}/></g>)}
      </svg>
    );
  };

  const final = E && E.pruebas.find(p => p.n === 8);
  return (
    <section id="results" className="s-pad" style={{ background:'var(--bg)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <SectionHead num="07" title="Resultados en la planta">
          Hicimos ocho pruebas de 15 s con el mismo hardware y la misma ley I-PD, con un programa de control de 2 ms que registra cada ciclo (las cifras se toman después de los primeros 3 s). El error rms bajó de 2,74° a 0,88° y el tiempo dentro de ±2° subió de 37 % a 99 %. Lo que más ayudó fue reducir el retardo del derivativo. Después agregamos el swing up: la varilla sube sola desde cualquiera de los dos topes y queda sostenida.
        </SectionHead>

        <div className="reveal g4-stats">
          {[['0,88°', 'error rms final (prueba 8)'], ['99 %', 'del tiempo dentro de ±2°'], [SW ? fmt(SW.izq.atrapa.real) + ' s' : '0,57 s', 'swing up: del tope a la vertical'], [SW ? fmt(SW.vi.rms, 1) + '°' : '2,3°', 'rms en el VI de LabVIEW (6,6 ms)']].map(([v, l], i) => (
            <div key={i} style={{ padding:'22px 20px', borderRight: i < 3 ? '1px solid #1e1e1e' : 'none' }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:'clamp(20px,2.4vw,28px)', fontWeight:600, color: i < 2 ? 'var(--red)' : 'var(--white)' }}>{v}</div>
              <div style={{ fontSize:13, color:'#8f8c86', marginTop:6 }}>{l}</div>
            </div>
          ))}
        </div>

        <figure className="reveal" style={{ ...box, margin:0, padding:'16px 16px 8px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10, marginBottom:8 }}>
            <div style={lbl}>Antes y después · ángulo medido</div>
            <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
              {[1, 2, 3, 4, 5, 6, 7].map(n => (
                <button key={n} onClick={() => setCmp(n)} style={{ fontFamily:'var(--mono)', fontSize:11, padding:'5px 9px', cursor:'pointer', border:`1px solid ${cmp === n ? 'var(--red)' : '#2a2a2a'}`, background: cmp === n ? '#23190f' : '#111', color:'#eee' }}>P{n}</button>
              ))}
              <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--g2)', alignSelf:'center', marginLeft:4 }}>vs. P8</span>
            </div>
          </div>
          <Antes/>
          <figcaption className="fig-cap">Datos crudos del encoder (registro a 2 ms). Banda verde: objetivo de ±2°. Prueba {cmp}: {E ? E.pruebas.find(p => p.n === cmp).cambio : ''}.</figcaption>
        </figure>

        <figure className="reveal" style={{ ...box, margin:'2px 0 0', padding:'16px 16px 8px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10, marginBottom:8 }}>
            <div style={lbl}>Swing up · planta contra gemelo</div>
            <div style={{ display:'flex', gap:4 }}>
              {[['izq', 'Tope izquierdo (corte 45°)'], ['der', 'Tope derecho (corte 30°)']].map(([k, t]) => (
                <button key={k} onClick={() => setLado(k)} aria-pressed={lado === k} style={{ fontFamily:'var(--sans)', fontSize:12, padding:'6px 10px', cursor:'pointer', border:`1px solid ${lado === k ? 'var(--red)' : '#2a2a2a'}`, background: lado === k ? '#23190f' : '#111', color:'#eee' }}>{t}</button>
              ))}
            </div>
          </div>
          <Swing/>
          <figcaption className="fig-cap">Registros del programa de 2 ms. Fondo naranja: sube con empuje máximo; fondo azul: planea con los motores apagados; sin fondo: la sostiene el I-PD (banda verde de ±2°).
            {lado === 'der' ? ' Con corte de 30° la varilla se pasó dos veces al otro lado antes de quedar: por eso el corte final es 45°.' : ' Con corte de 45° subió al primer intento.'} El gemelo, con el mismo código y el motor ajustado a estos registros, la atrapa unas décimas antes.</figcaption>
        </figure>

        <div className="reveal" style={{ marginTop:2 }}>
          <div style={{ ...box, padding:'18px 20px' }}>
            <div style={{ ...lbl, marginBottom:12 }}>En el VI de LabVIEW</div>
            <div style={{ fontSize:15, color:'#b3b0aa', lineHeight:1.7 }}>
              Con el mismo ajuste (filtro de 5 ms, Kv 0,6) y el Wait de 1 ms, el VI corre a 6,6 ms por ciclo. Medido desde su gráfica durante 44 s: <b style={{ color:'var(--white)' }}>{SW ? fmt(SW.vi.rms, 1) : '2,3'}° rms y {SW ? SW.vi.dentro : 62} % del tiempo dentro de ±2°</b>.
              Lo limita su lazo más lento, no el ajuste. El swing up también quedó en el VI, con el selector Modo de arranque. Antes de estos cambios, lo normal era ±15–25° y el mejor resultado había sido ±6°.
            </div>
            <div style={{ ...lbl, margin:'18px 0 10px' }}>Lecciones</div>
            <ul style={{ margin:0, paddingLeft:18, fontSize:14.5, color:'#b3b0aa', lineHeight:1.75 }}>
              <li>En una planta inestable, el retardo importa tanto como las ganancias.</li>
              <li>Medir antes de ajustar: los ensayos de escalón explicaron en minutos lo que horas de prueba y error no.</li>
              <li>Un actuador casi todo/nada necesita correcciones pequeñas y a tiempo.</li>
              <li>Muchos problemas no eran del código: nombre de la DAQ, NI MAX con las líneas tomadas, cableado del encoder, amplitud de la sierra.</li>
            </ul>
            <div style={{ marginTop:16, background:'#120d08', border:'1px dashed #6a3a12', padding:'12px 14px', fontSize:14, color:'#b3b0aa', lineHeight:1.6 }}>
              <b style={{ color:'#E5B000' }}>Pendiente:</b> pasar los DAQ Assistant a DAQmx de bajo nivel para llegar a ~2 ms dentro de LabVIEW, donde el programa externo ya da 0,88°.
            </div>
          </div>
        </div>
        <Desplegable titulo="Las 8 pruebas en detalle">
        <div style={{ ...box, marginTop:2, overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, minWidth:700 }}>
            <thead><tr>{['Prueba', 'Cambio', 'rms real', 'Rango real', 'Dentro de ±2°', 'rms del gemelo (5 corridas)'].map(h => <th key={h} style={{ textAlign:'left', padding:'10px 14px', color:'var(--g1)', fontSize:13, fontWeight:600, borderBottom:'1px solid #222' }}>{h}</th>)}</tr></thead>
            <tbody>{(E ? E.pruebas : []).map(p => (
              <tr key={p.n} style={{ background: p.n === 8 ? 'rgba(244,96,8,.07)' : 'transparent' }}>
                <td style={{ padding:'8px 14px', borderBottom:'1px solid #161616', fontFamily:'var(--mono)' }}>{p.n}</td>
                <td style={{ padding:'8px 14px', borderBottom:'1px solid #161616', color:'var(--g1)' }}>{p.cambio}</td>
                <td style={{ padding:'8px 14px', borderBottom:'1px solid #161616', fontFamily:'var(--mono)', color: p.n === 8 ? 'var(--red)' : 'inherit', fontWeight: p.n === 8 ? 700 : 400 }}>{fmt(p.rms)}°</td>
                <td style={{ padding:'8px 14px', borderBottom:'1px solid #161616', fontFamily:'var(--mono)' }}>{fmt(p.min, 1)} a {fmt(p.max, 1)}°</td>
                <td style={{ padding:'8px 14px', borderBottom:'1px solid #161616', fontFamily:'var(--mono)', color: p.pct >= 95 ? '#3ddc84' : 'inherit' }}>{p.pct} %</td>
                <td style={{ padding:'8px 14px', borderBottom:'1px solid #161616', fontFamily:'var(--mono)', color:'#4A9EFF' }}>{gemelo[p.n] ? fmt(gemelo[p.n].rms) + '°' : '…'}</td>
              </tr>))}</tbody>
          </table>
        </div>
        <figure style={{ ...box, margin:'2px 0 0', padding:'14px 16px 6px' }}>
          <Barras/>
          <figcaption className="fig-cap">Bajar Kd empeora; bajar Kv mejora hasta ≈ 0,6; el salto viene del filtro del derivativo (20 → 10 → 5 ms). El gemelo, calibrado con los ensayos de escalón
            (promedio de 5 corridas), coincide dentro de ~0,3° en las pruebas 1, 3, 4, 7 y 8 y reproduce el salto del filtro. Se aleja en la 2 (la planta fue mucho peor con Kp 3 y Kd 0,6),
            la 5 y la 6: le faltan la fricción real del pivote y las vibraciones de la estructura.</figcaption>
        </figure>

        </Desplegable>
        <Desplegable titulo="Los 42 ensayos de ternas en el equipo">
        <figure style={{ ...box, margin:'2px 0 0', padding:'16px 16px 8px' }}>
          <Intentos/>
          <div style={{ minHeight:64, borderTop:'1px solid #1a1a1a', padding:'10px 4px 4px', fontSize:13, color:'var(--g1)', lineHeight:1.55 }}>
            {hi ? <>
              <b style={{ color: COLF[hi.fase], fontFamily:'var(--mono)' }}>#{hi.i} · fase {hi.fase} · {hi.donde === 'VI' ? `VI (${fmt(hi.lazo, 1)} ms)` : 'programa externo (2 ms)'}</b>
              <span style={{ fontFamily:'var(--mono)', marginLeft:10 }}>Kp {fmt(hi.Kp)} · Ki {fmt(hi.Ki)} · Kd {fmt(hi.Kd)}{hi.Kv !== '-' ? ` · Kv ${String(hi.Kv).replace('.', ',')}` : ''}</span>
              <span style={{ marginLeft:10, color: hi.cayo ? '#ff4d4d' : '#c9c6c1' }}>{hi.cayo ? 'se cayó' : hi.rms != null ? `rms ${fmt(hi.rms)}° · ${hi.pct} % en ±2°` : `≈ ±${fmt(hi.err, 0)}°`}</span>
              <div style={{ marginTop:4 }}>{hi.decision}</div>
            </> : <span style={{ color:'var(--g2)' }}>Pasa el puntero (o toca) un punto para ver la terna, el resultado y la decisión que se tomó.</span>}
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 16px', padding:'6px 4px 2px', fontFamily:'var(--mono)', fontSize:12, color:'var(--g1)' }}>
            {H && Object.entries(H.fases).map(([k, v]) => <span key={k}><i style={{ display:'inline-block', width:9, height:9, borderRadius:'50%', background:COLF[k], marginRight:6, verticalAlign:-1 }}/>{k}: {v}</span>)}
            <span>✕ = se cayó · línea blanca = mejor resultado hasta ese intento</span>
          </div>
          <figcaption className="fig-cap">Intentos 1–33 y 42 leídos de las gráficas del VI (error máximo ≈ |centro| + amplitud, al grado); 34–41 medidos con registro completo. La búsqueda se estancó en ±6°
            hasta que se midió la planta: ahí apareció el retardo del derivativo.</figcaption>
        </figure>

        </Desplegable>
        <Desplegable titulo="Identificación de los motores (ensayos de escalón)">
          <figure style={{ ...box, margin:0, padding:'14px 16px 6px' }}>
            <Escalones/>
            <figcaption className="fig-cap">Ensayos de escalón: torque ajustado de 44–47 mN·m en todos (satura casi enseguida), τm = 0,02–0,04 s. El izquierdo da ≈ 5 % más, y cerca del umbral eso es
              3 a 5 veces más subida. Aun al mínimo (AO 4,75 V) da 17–20 mN·m, 4–5 veces lo que pide la gravedad a 5°.</figcaption>
          </figure>
        </Desplegable>
      </div>
    </section>
  );
};
Object.assign(window, { ResultsSection });
