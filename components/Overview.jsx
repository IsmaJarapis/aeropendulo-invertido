/* El problema, explicado con calma: un dibujo de la planta que se inclina con un solo control,
   tres ideas cortas y cómo se resuelve en tres pasos. Nada se mueve solo. */
const OverviewSection = () => {
  const { useState } = React;
  const [th, setTh] = useState(12);                       // inclinación elegida por el lector [°]
  const K = 0.0461;                                       // N·m/rad, rigidez gravitacional medida
  const grav = K * Math.sin(Math.abs(th) * Math.PI / 180) * 1000;   // mN·m
  const dentro = Math.abs(th) <= 2;
  const lado = th > 0 ? 'derecha' : 'izquierda';
  const motor = th > 0 ? 'derecho' : 'izquierdo';
  const f = (x, d = 1) => x.toFixed(d).replace('.', ',');

  // ── dibujo de la planta (vista de frente) ──
  const Planta = () => {
    const px = 210, py = 330, L = 225, a = th * Math.PI / 180;
    const cm = { x: px + 0.62 * L * Math.sin(a), y: py - 0.62 * L * Math.cos(a) };
    const ref = (ang, r) => [px + r * Math.sin(ang * Math.PI / 180), py - r * Math.cos(ang * Math.PI / 180)];
    const [b1x, b1y] = ref(-2, 250), [b2x, b2y] = ref(2, 250);
    const arco = (() => { const r = 70, [x1, y1] = ref(0, r), [x2, y2] = ref(th, r); return `M${x1} ${y1} A${r} ${r} 0 0 ${th > 0 ? 1 : 0} ${x2} ${y2}`; })();
    const [lx, ly] = ref(th / 2, 92);
    const enc = !dentro;                                  // fuera de la banda, el control enciende un motor
    return (
      <svg viewBox="0 0 420 470" width="100%" role="img" aria-label={`Aeropéndulo visto de frente, inclinado ${f(th, 0)} grados`} style={{ display: 'block', maxWidth: 440, margin: '0 auto' }}>
        <defs>
          <marker id="pr-f" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#F46008" /></marker>
          <marker id="pr-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#4A9EFF" /></marker>
        </defs>
        {/* banda de ±2° y vertical de referencia */}
        <path d={`M${px} ${py} L${b1x} ${b1y} L${b2x} ${b2y} Z`} fill="rgba(25,179,166,.22)" />
        <line x1={px} y1={py} x2={px} y2={py - 262} stroke="#555" strokeDasharray="5 5" />
        <text x={px + 8} y={py - 250} fill="#19b3a6" fontSize="13" fontFamily="Inter, sans-serif">±2°</text>
        {/* topes */}
        {[-70, 70].map(t => { const [x, y] = ref(t, 120); return <line key={t} x1={px} y1={py} x2={x} y2={y} stroke="#6a3a12" strokeWidth="2" strokeDasharray="4 5" />; })}
        <text x={px - 128} y={py - 22} fill="#8a6a4a" fontSize="12" fontFamily="Inter, sans-serif">tope</text>
        <text x={px + 100} y={py - 22} fill="#8a6a4a" fontSize="12" fontFamily="Inter, sans-serif">tope</text>
        {/* base y mástil */}
        <rect x={110} y={440} width={200} height={14} rx={3} fill="#2a2a2a" />
        <rect x={192} y={py} width={36} height={110} rx={4} fill="#1d1d1d" stroke="#333" />
        {/* varilla, soporte, motores y hélices: giran juntos */}
        <g transform={`rotate(${th} ${px} ${py})`}>
          <line x1={px} y1={py} x2={px} y2={py - L} stroke="#e8e6e1" strokeWidth="6" strokeLinecap="round" />
          <rect x={px - 62} y={py - L - 6} width={124} height={12} rx={4} fill="#c0392b" />
          {[-1, 1].map(s => (
            <g key={s}>
              <rect x={px + s * 62 - 9} y={py - L - 22} width={18} height={26} rx={3} fill="#bbb" />
              <ellipse cx={px + s * 78} cy={py - L - 9} rx={5} ry={24} fill="#888" opacity=".8" />
            </g>
          ))}
          {enc && (() => {                                // empuje del motor encendido, perpendicular a la varilla
            const s = th > 0 ? 1 : -1;                     // inclinada a la derecha → motor derecho, empuja a la izquierda
            return (
              <g>
                {[0, 1, 2].map(i => <line key={i} x1={px + s * (90 + i * 2)} y1={py - L - 18 + i * 9} x2={px + s * (122 + i * 4)} y2={py - L - 18 + i * 9} stroke="#7aa7d8" strokeWidth="2" strokeDasharray="4 4" />)}
                <line x1={px + s * 40} y1={py - L + 34} x2={px - s * 34} y2={py - L + 34} stroke="#F46008" strokeWidth="4" markerEnd="url(#pr-f)" />
              </g>
            );
          })()}
        </g>
        {/* pivote (encoder) */}
        <circle cx={px} cy={py} r={9} fill="#0D0D0D" stroke="#F46008" strokeWidth="3" />
        {/* ángulo */}
        {Math.abs(th) >= 3 && <path d={arco} fill="none" stroke="#F0EEE9" strokeWidth="1.5" />}
        {Math.abs(th) >= 3 && <text x={lx} y={ly} fill="#F0EEE9" fontSize="16" fontStyle="italic" fontFamily="Inter, sans-serif" textAnchor="middle">θ</text>}
        {/* gravedad en el centro de masa */}
        <circle cx={cm.x} cy={cm.y} r={4} fill="#4A9EFF" />
        <line x1={cm.x} y1={cm.y} x2={cm.x} y2={cm.y + 58} stroke="#4A9EFF" strokeWidth="3" markerEnd="url(#pr-g)" />
        <text x={cm.x + (th >= 0 ? 10 : -10)} y={cm.y + 52} fill="#4A9EFF" fontSize="13" fontFamily="Inter, sans-serif" textAnchor={th >= 0 ? 'start' : 'end'}>peso</text>
      </svg>
    );
  };

  const Idea = ({ n, titulo, children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: 12, padding: '16px 0', borderBottom: '1px solid #1c1c1c' }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--red)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 14 }}>{n}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{titulo}</div>
        <div style={{ fontSize: 15, lineHeight: 1.65, color: '#c3c0ba' }}>{children}</div>
      </div>
    </div>
  );

  const Paso = ({ n, titulo, que, como }) => (
    <div style={{ background: '#0b0b0b', border: '1px solid #1f1f1f', borderRadius: 12, padding: '18px 18px 16px', minWidth: 0 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--red)', marginBottom: 6 }}>{n}</div>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{titulo}</div>
      <div style={{ fontSize: 14.5, lineHeight: 1.6, color: '#c3c0ba', marginBottom: 8 }}>{que}</div>
      <div style={{ fontSize: 13, color: '#8f8c86' }}>{como}</div>
    </div>
  );

  return (
    <section id="overview" className="s-pad" style={{ background: 'var(--bg)' }}>
      <style>{`
        .pr-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: clamp(20px, 4vw, 56px); align-items: start; }
        .pr-pasos { display: grid; grid-template-columns: 1fr 34px 1fr 34px 1fr; align-items: stretch; }
        .pr-flecha { display: flex; align-items: center; justify-content: center; color: #555; font-size: 20px; }
        @media (max-width: 860px) { .pr-grid { grid-template-columns: 1fr; } .pr-pasos { grid-template-columns: 1fr; } .pr-flecha { transform: rotate(90deg); padding: 4px 0; } }
        #pr-th { width: 100%; accent-color: #F46008; }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <SectionHead num="01" title="El problema" />

        <div className="pr-grid reveal">
          <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 14, padding: 'clamp(14px, 2.4vw, 24px)' }}>
            <Planta />
            <label htmlFor="pr-th" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#c3c0ba', margin: '10px 0 6px' }}>
              <span>Inclina la varilla</span><b style={{ fontFamily: 'var(--mono)', color: 'var(--white)' }}>θ = {f(th, 0)}°</b>
            </label>
            <input id="pr-th" type="range" min="-30" max="30" step="1" value={th} onChange={e => setTh(+e.target.value)} />
            <div aria-live="polite" style={{ marginTop: 12, fontSize: 14.5, lineHeight: 1.6, color: '#c3c0ba', minHeight: 70 }}>
              {th === 0
                ? <>En la vertical exacta la gravedad no la tumba, pero el equilibrio es frágil: cualquier desvío, por pequeño que sea, empieza a crecer.</>
                : dentro
                  ? <>Inclinada {f(Math.abs(th), 0)}° a la {lado}: está <b style={{ color: '#19b3a6' }}>dentro de la tolerancia de ±2°</b>. El control solo hace correcciones pequeñas.</>
                  : <>Inclinada {f(Math.abs(th), 0)}° a la {lado}, el peso la empuja hacia ese lado con <b style={{ color: '#4A9EFF' }}>{f(grav)} mN·m</b>. El control enciende el <b style={{ color: 'var(--red)' }}>motor {motor}</b>: su hélice sopla hacia afuera y empuja la varilla de vuelta.</>}
            </div>
          </div>

          <div>
            <Idea n="1" titulo="La planta">Una varilla de 25 cm que gira sobre un pivote en la base. En la punta lleva dos motores con hélice, uno a cada lado. Un encoder en el pivote mide el ángulo θ.</Idea>
            <Idea n="2" titulo="El objetivo">Que la varilla se quede vertical (θ = 0) con un error máximo de <b style={{ color: 'var(--white)' }}>±2°</b>, aunque la golpeen. Y que pueda subir sola desde el tope donde descansa.</Idea>
            <Idea n="3" titulo="Por qué es difícil">La vertical es inestable: si nadie corrige, el error se duplica cada 0,11 s hasta que la varilla cae al tope (a unos 70°). Además, solo puede encenderse un motor a la vez y los motores son casi todo o nada.</Idea>
          </div>
        </div>

        <h3 className="reveal" style={{ fontSize: 20, fontWeight: 700, margin: '40px 0 14px' }}>Cómo lo resolvemos</h3>
        <div className="pr-pasos reveal">
          <Paso n="1" titulo="Medir" que="El encoder cuenta cuánto giró la varilla." como="2000 pulsos por vuelta · 0,045° de resolución" />
          <div className="pr-flecha" aria-hidden="true">→</div>
          <Paso n="2" titulo="Decidir" que="Un control I-PD en LabVIEW calcula qué motor encender y con cuánta fuerza." como="cada 6,6 ms · Kp 2 · Ki 0,4 · Kd 0,9" />
          <div className="pr-flecha" aria-hidden="true">→</div>
          <Paso n="3" titulo="Actuar" que="La DAQ manda la orden; el comparador y el puente H dan la potencia al motor." como="NI USB-6212 → LM324 (PWM) → L298N" />
        </div>
        <p className="reveal" style={{ fontSize: 14, color: '#8f8c86', marginTop: 12 }}>Y vuelve a medir: es un lazo cerrado que se repite unas 150 veces por segundo.</p>
      </div>
    </section>
  );
};
Object.assign(window, { OverviewSection });
