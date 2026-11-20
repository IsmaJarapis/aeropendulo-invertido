const { useEffect: useEffectModel, useRef: useRefModel } = React;

const Eq = ({ tex, display = false }) => {
  const ref = useRefModel();
  useEffectModel(() => {
    if (window.katex && ref.current) { try { katex.render(tex, ref.current, { displayMode: display, throwOnError: false }); } catch (e) {} }
  }, [tex, display]);
  return <span ref={ref} />;
};

/* Bloque del modelo: título normal, sin etiquetas en mayúsculas */
const Card = ({ n, title, children }) => (
  <div style={{ background:'#0b0b0b', border:'1px solid #1c1c1c', padding:'clamp(20px,3vw,32px)', minWidth:0 }}>
    <h3 style={{ fontFamily:'var(--sans)', fontSize:18, fontWeight:700, color:'var(--white)', marginBottom:14, display:'flex', gap:10, alignItems:'baseline' }}>
      <span style={{ color:'var(--red)', fontFamily:'var(--mono)', fontSize:15 }}>{n}</span>{title}
    </h3>
    {children}
  </div>
);
const Txt = ({ children }) => <p style={{ fontFamily:'var(--sans)', fontSize:14.5, color:'#a9a6a0', marginBottom:12, lineHeight:1.65 }}>{children}</p>;
const EqBox = ({ children, hl }) => (
  <div style={{ margin:'4px 0 16px', paddingLeft:12, borderLeft: hl ? '2px solid var(--red)' : '2px solid #262626', overflowX:'auto', overflowY:'hidden' }}>{children}</div>
);

const ModelSection = () => {
  const S = window.AeroSim;
  const ol = S.openLoopPoles({ tau: 0.03 }).map(z => S.fmtPole(z));
  const tabla = [
    ['Constante del motor-hélice τm', '0,10 s (supuesta)', '0,02–0,04 s', 'ensayo de escalón'],
    ['Respuesta del motor', 'empuje proporcional a V', 'casi todo/nada: 17–20 mN·m al mínimo, 44–47 mN·m saturado', 'ensayo de escalón y baja potencia'],
    ['Diferencia entre motores', '9 % de empuje a 3,5 V', 'el izquierdo da ≈ 5 % más torque', 'ensayo de escalón'],
    ['Retardo puro del motor', 'no se consideró', '0 a 0,02 s', 'ensayo de escalón'],
    ['Topes mecánicos', '≈ 85°', '−70,7° / +69,85°', 'medidos con el encoder'],
    ['Período del lazo', '10 ms', '10,5 ms → 6,6 ms (VI) · 2 ms (DAQmx)', 'contador de iteraciones'],
    ['Retardo del derivativo', '—', '≈ 40 ms → 5 ms con el filtro', 'cálculo a partir de h'],
    ['Fricción del pivote b', '1×10⁻⁴ N·m·s', 'sin medir', '—'],
  ];

  return (
    <section id="model" className="s-pad" style={{ background:'var(--bg)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <SectionHead num="04" title="Modelo matemático">
          La varilla es un cuerpo rígido que gira alrededor del eje del encoder. Planteamos la ecuación de movimiento con Lagrange,
          medimos el actuador con ensayos de escalón y ajustamos el modelo con esos datos. Ese es el modelo que corre en el gemelo digital.
        </SectionHead>

        <div className="g2-tight reveal" style={{ marginBottom:2 }}>
          <Card n="1" title="Ecuación de movimiento (Lagrange)">
            <Txt>Con θ medido desde la vertical (positivo a la derecha, vista de frente), la energía cinética y la potencial del conjunto son</Txt>
            <EqBox><Eq display tex={String.raw`T=\tfrac12\,I\,\dot\theta^{2},\qquad V=\textstyle\sum m_i\,g\,d_i\cos\theta = K\cos\theta`}/></EqBox>
            <Txt>donde d<sub>i</sub> es la distancia de cada masa al pivote. Con L = T − V y los torques no conservativos (motor, fricción y perturbación):</Txt>
            <EqBox><Eq display tex={String.raw`\frac{d}{dt}\frac{\partial L}{\partial\dot\theta}-\frac{\partial L}{\partial\theta}=\tau_{mot}-b\,\dot\theta+\tau_d`}/></EqBox>
            <EqBox hl><Eq display tex={String.raw`I\,\ddot\theta + b\,\dot\theta - K\sin\theta = \tau_{izq}-\tau_{der}+\tau_d`}/></EqBox>
            <Txt>Con las masas y distancias medidas: I = 1,14×10⁻³ kg·m² y K = 0,0461 N·m/rad. El signo de K sin θ es el contrario al de un péndulo colgante:
              la gravedad aleja la varilla de la vertical. En el tope izquierdo, a 70,7°, pide K sin 70,7° = 43,5 mN·m: por eso el swing up arranca con el empuje máximo.</Txt>
          </Card>

          <Card n="2" title="El actuador, medido">
            <Txt>Cada motor sopla hacia afuera, así que el izquierdo empuja la varilla a la derecha y viceversa. Solo uno se enciende a la vez.
              Con la varilla apoyada en el tope, encendimos cada motor 0,6 s y registramos el encoder a 1,8 kHz. Ajustando J θ̈ = K sin θ − T(t) a esas subidas:</Txt>
            <EqBox hl><Eq display tex={String.raw`T_{ss}(V)=T_{max}\left(1-e^{-V/V_s}\right),\quad T_{max}\approx 47\ \text{mN·m},\ V_s\approx 0{,}42\ \text{V}`}/></EqBox>
            <EqBox><Eq display tex={String.raw`\tau_m\,\dot T + T = T_{ss}\big(V(t-t_d)\big),\qquad \tau_m\approx 0{,}03\ \text{s},\ t_d\approx 0{,}01\ \text{s}`}/></EqBox>
            <Txt>V es el voltaje que pide el VI, V = V<sub>off</sub> + K<sub>v</sub>·|u| con V<sub>off</sub> = 0,2 V y K<sub>v</sub> = 0,6. El PWM del circuito quedó invertido,
              por eso a la salida analógica se escribe AO = 5 − V.</Txt>
            <Txt>Aun al mínimo, el motor da 17–20 mN·m: cuatro o cinco veces lo que pide la gravedad a 5° (≈ 4 mN·m). Por eso las correcciones tienen que ser pequeñas y a tiempo.</Txt>
          </Card>
        </div>

        <div className="g2-tight reveal" style={{ marginBottom:2 }}>
          <Card n="3" title="Linealización y polos">
            <Txt>Cerca de la vertical (sin θ ≈ θ), con una ganancia local K<sub>m</sub> del actuador:</Txt>
            <EqBox hl><Eq display tex={String.raw`G(s)=\frac{\Theta(s)}{U(s)}=\frac{K_m\,e^{-t_d s}}{(\tau_m s+1)\,(I s^2+b s-K)}`}/></EqBox>
            <Txt>Polos en lazo abierto con τm = 0,03 s:</Txt>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
              {ol.map((p, i) => (
                <div key={i} style={{ flex:1, minWidth:90, background:'#0e0e0e', border:`1px solid ${i===0?'#E5B000':'#222'}`, padding:'10px 12px', textAlign:'center' }}>
                  <div style={{ fontFamily:'var(--mono)', fontSize:16, fontWeight:600, color: i===0 ? '#E5B000' : 'var(--white)' }}>{p}</div>
                  <div style={{ fontSize:12, color:'var(--g1)', marginTop:4 }}>p{i+1} [s⁻¹]</div>
                </div>
              ))}
            </div>
            <Txt>p₁ = +6,3 s⁻¹ está en el semiplano derecho: sin control, un error se duplica cada ln 2 / 6,3 ≈ 0,11 s. El modelo lineal sirve para el diseño inicial,
              pero el actuador casi todo/nada hace que la planta real se comporte más como un relé con zona proporcional pequeña.</Txt>
          </Card>

          <Card n="4" title="Control I-PD y por qué importaba el retardo">
            <EqBox hl><Eq display tex={String.raw`u = K_i\!\int\!(\theta_{ref}-\theta)\,dt - K_p\,\theta - K_d\,\hat{\dot\theta}`}/></EqBox>
            <Txt>P y D actúan sobre la medida y la integral sobre el error. La velocidad se estima con un filtro de primer orden de constante τ<sub>f</sub>:</Txt>
            <EqBox><Eq display tex={String.raw`\hat{\dot\theta}_k = a\,\hat{\dot\theta}_{k-1} + (1-a)\,\frac{\theta_k-\theta_{k-1}}{h},\qquad a=e^{-h/\tau_f}`}/></EqBox>
            <Txt>Un retardo τ resta una fase de 360°·f·τ. La varilla oscilaba cerca de 3 Hz: con el cálculo original (≈ 40 ms) el derivativo llegaba con ≈ 43° de atraso
              y frenaba tarde; con τ<sub>f</sub> = 5 ms el atraso baja a ≈ 5°.</Txt>
            <div style={{ fontSize:14.5, color:'var(--white)', lineHeight:1.65 }}>
              Ganancias finales: <b style={{ color:'var(--red)' }}>K<sub>p</sub> = 2 · K<sub>i</sub> = 0,4 · K<sub>d</sub> = 0,9</b> por radián, con K<sub>v</sub> = 0,6.
              Las del diseño (K<sub>p</sub> = 2,23 · K<sub>i</sub> = 0,28 · K<sub>d</sub> = 0,38) fueron el punto de partida.
            </div>
          </Card>
        </div>

        <div className="reveal" style={{ background:'#0b0b0b', border:'1px solid #1c1c1c', padding:'clamp(18px,3vw,28px)', marginBottom:2, overflowX:'auto' }}>
          <h3 style={{ fontFamily:'var(--sans)', fontSize:18, fontWeight:700, marginBottom:14 }}>Lo que supusimos y lo que medimos</h3>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14, minWidth:680 }}>
            <thead><tr>{['Parámetro', 'En el diseño', 'En la planta', 'Cómo se midió'].map(h => <th key={h} style={{ textAlign:'left', padding:'8px 10px', color:'var(--g1)', fontWeight:600, borderBottom:'1px solid #2a2a2a' }}>{h}</th>)}</tr></thead>
            <tbody>{tabla.map(r => (
              <tr key={r[0]}>{r.map((c, i) => <td key={i} style={{ padding:'9px 10px', borderBottom:'1px solid #181818', color: i === 2 ? 'var(--white)' : '#a9a6a0', fontWeight: i === 2 ? 600 : 400 }}>{c}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>

        <div className="reveal" style={{ background:'#0b0b0b', border:'1px solid #1c1c1c', padding:'clamp(20px,3vw,32px)', overflowX:'auto' }}>
          <h3 style={{ fontFamily:'var(--sans)', fontSize:18, fontWeight:700, marginBottom:18 }}>Diagrama de bloques del lazo</h3>
          <div style={{ minWidth:640, background:'#fff', padding:'10px 8px' }}><img src="assets/diagramas/lazo.svg" alt="Diagrama de bloques del lazo cerrado I-PD" style={{ display:'block', width:'100%' }}/></div>
          <p className="fig-cap" style={{ marginTop:10 }}>La integral actúa sobre el error; P y D actúan sobre el ángulo medido (forma I-PD), así un cambio de referencia no da un salto en u. El signo de u elige el motor y su magnitud fija el voltaje.</p>
        </div>
      </div>
    </section>
  );
};

const LoopDiagram = () => {
  const B = ({ x, y, w = 96, t1, t2, c = '#333', fill = '#111' }) => (
    <g>
      <rect x={x} y={y} width={w} height="40" rx="3" fill={fill} stroke={c} strokeWidth="1.3"/>
      <text x={x + w/2} y={y + 16} fill="#eee" fontSize="10.5" fontFamily="Inter, sans-serif" fontWeight="600" textAnchor="middle">{t1}</text>
      <text x={x + w/2} y={y + 31} fill="#9a9a9a" fontSize="8.5" fontFamily="'JetBrains Mono',monospace" textAnchor="middle">{t2}</text>
    </g>
  );
  const A = ({ x1, x2, y }) => <line x1={x1} y1={y} x2={x2} y2={y} stroke="#666" strokeWidth="1" markerEnd="url(#ma)"/>;
  return (
    <svg viewBox="0 0 800 175" fill="none" style={{ width:'100%' }} role="img" aria-label="Diagrama de bloques del lazo cerrado">
      <defs>
        <marker id="ma" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#666"/></marker>
        <marker id="mb" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#4A9EFF"/></marker>
      </defs>
      <text x="2" y="54" fill="#9a9a9a" fontSize="11" fontFamily="Inter, sans-serif">θref</text>
      <A x1={32} x2={56} y={50}/>
      <circle cx="68" cy="50" r="12" stroke="#555" strokeWidth="1.2" fill="#0c0c0c"/>
      <text x="63" y="54" fill="#999" fontSize="11">+</text><text x="60" y="69" fill="#777" fontSize="9">−</text>
      <A x1={80} x2={100} y={50}/>
      <B x={100} y={30} w={112} t1="I-PD en LabVIEW" t2="derivativo filtrado 5 ms" c="#F46008"/>
      <A x1={212} x2={228} y={50}/>
      <B x={228} y={30} w={104} t1="Actuador lineal" t2="V = Voff + Kv·|u|"/>
      <A x1={332} x2={348} y={50}/>
      <B x={348} y={30} w={100} t1="AO → PWM → L298N" t2="AO = 5 − V · LM324"/>
      <A x1={448} x2={464} y={50}/>
      <B x={464} y={30} w={104} t1="Motor + hélice" t2="T(V) · τm = 0,03 s"/>
      <A x1={568} x2={584} y={50}/>
      <B x={584} y={30} w={110} t1="Varilla" t2="I θ̈ + b θ̇ − K sin θ" c="#F46008" fill="#0d0d0d"/>
      <A x1={694} x2={760} y={50}/>
      <text x="766" y="54" fill="#bbb" fontSize="12" fontFamily="Inter, sans-serif" fontStyle="italic">θ</text>
      <circle cx="728" cy="50" r="2.5" fill="#666"/>
      <rect x="566" y="116" width="150" height="36" rx="3" fill="#111" stroke="#4A9EFF" strokeWidth="1.2"/>
      <text x="641" y="131" fill="#cfe3ff" fontSize="10.5" fontFamily="Inter, sans-serif" fontWeight="600" textAnchor="middle">Encoder E6B2 · X4</text>
      <text x="641" y="145" fill="#6d8fb5" fontSize="8.5" fontFamily="'JetBrains Mono',monospace" textAnchor="middle">contador de la DAQ · 0,045°</text>
      <polyline points="728,50 728,134 716,134" stroke="#4A9EFF" strokeWidth="0.9" strokeDasharray="4 2" fill="none" markerEnd="url(#mb)"/>
      <polyline points="566,134 68,134 68,62" stroke="#4A9EFF" strokeWidth="0.9" strokeDasharray="4 2" fill="none" markerEnd="url(#mb)"/>
      <text x="600" y="104" fill="#7a6a30" fontSize="9" fontFamily="Inter, sans-serif">τd: golpe o aire</text>
      <line x1="636" y1="96" x2="640" y2="74" stroke="#7a6a30" strokeWidth="1" markerEnd="url(#ma)"/>
    </svg>
  );
};

Object.assign(window, { ModelSection, LoopDiagram, Eq });
