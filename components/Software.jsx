/* 06 — El VI: diagrama de flujo completo, pantallazos, descargas y el código (desplegable) */

/* Diagrama de flujo del programa completo, en zigzag: fila 1 → , fila 2 ← , fila 3 → */
const FlujoVI = () => {
  const W = 150, H = 66, G = 40, X = i => i * (W + G), Y = [40, 236, 432];
  const col = { io:'#4A9EFF', proc:'#8f8c87', ctl:'#F46008', dec:'#E5B000', fin:'#3ddc84' };
  const Nodo = ({ i, f, tipo, lineas }) => {
    const x = X(i), y = Y[f], c = col[tipo];
    const forma = tipo === 'dec'
      ? <polygon points={`${x + W/2},${y - 6} ${x + W + 6},${y + H/2} ${x + W/2},${y + H + 6} ${x - 6},${y + H/2}`} fill="#121212" stroke={c} strokeWidth="1.6"/>
      : tipo === 'io'
        ? <polygon points={`${x + 12},${y} ${x + W},${y} ${x + W - 12},${y + H} ${x},${y + H}`} fill="#121212" stroke={c} strokeWidth="1.6"/>
        : <rect x={x} y={y} width={W} height={H} rx={tipo === 'fin' ? H/2 : 6} fill="#121212" stroke={c} strokeWidth="1.6"/>;
    return (
      <g>
        {forma}
        {lineas.map((l, k) => (
          <text key={k} x={x + W/2} y={y + H/2 + (k - (lineas.length - 1) / 2) * 15 + 4.5} fill={k === 0 ? '#f0eee9' : '#a9a6a0'} fontSize={k === 0 ? 12.5 : 11} fontWeight={k === 0 ? 600 : 400}
            fontFamily="Inter, sans-serif" textAnchor="middle">{l}</text>
        ))}
      </g>
    );
  };
  const F = ({ d, t, tx, ty }) => (<g><path d={d} stroke="#6a6a6a" strokeWidth="1.4" fill="none" markerEnd="url(#fv)"/>{t && <text x={tx} y={ty} fill="#E5B000" fontSize="11" fontFamily="Inter, sans-serif">{t}</text>}</g>);
  const cx = i => X(i) + W/2;
  return (
    <svg viewBox="-10 0 1160 530" style={{ width:'100%', minWidth:880, display:'block' }} role="img" aria-label="Diagrama de flujo del programa de control en LabVIEW">
      <defs><marker id="fv" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#6a6a6a"/></marker></defs>
      {/* fila 1 */}
      <Nodo i={0} f={0} tipo="fin" lineas={['Run', 'se abre el VI']}/>
      <Nodo i={1} f={0} tipo="io" lineas={['Configurar DAQ', '3 DAQ Assistant · Dev10']}/>
      <Nodo i={2} f={0} tipo="io" lineas={['Leer el encoder', 'ctr0 · X4 · grados']}/>
      <Nodo i={3} f={0} tipo="dec" lineas={['¿Primera vuelta', 'o Tarar?']}/>
      <Nodo i={4} f={0} tipo="proc" lineas={['Ángulo y tiempo', 'θ = lectura − cero', 'h = Δt entre ciclos']}/>
      <Nodo i={5} f={0} tipo="proc" lineas={['Velocidad filtrada', 'd ← a·d + (1−a)·Δθ/h', 'filtro de 5 ms']}/>
      {[0, 1, 3, 4].map(i => <F key={i} d={`M${X(i) + W} ${Y[0] + H/2} L${X(i + 1) - 6} ${Y[0] + H/2}`}/>)}
      <F d={`M${X(2) + W + 6} ${Y[0] + H/2} L${X(3) - 8} ${Y[0] + H/2}`}/>
      <text x={X(4) - 30} y={Y[0] + H/2 - 8} fill="#E5B000" fontSize="11" fontFamily="Inter, sans-serif">no</text>
      <rect x={X(3)} y={130} width={W} height={46} rx="6" fill="#121212" stroke="#8f8c87" strokeWidth="1.2"/>
      <text x={cx(3)} y={150} fill="#f0eee9" fontSize="12" fontWeight="600" fontFamily="Inter, sans-serif" textAnchor="middle">cero = lectura</text>
      <text x={cx(3)} y={166} fill="#a9a6a0" fontSize="11" fontFamily="Inter, sans-serif" textAnchor="middle">integral y d en 0</text>
      <F d={`M${cx(3)} ${Y[0] + H + 6} L${cx(3)} 128`} t="sí" tx={cx(3) + 6} ty={Y[0] + H + 22}/>
      <F d={`M${X(3) + W} 153 L${cx(4)} 153 L${cx(4)} ${Y[0] + H + 2}`}/>
      {/* bajada a la fila 2 */}
      <F d={`M${cx(5)} ${Y[0] + H} L${cx(5)} ${Y[1] - 4}`}/>
      {/* fila 2 (de derecha a izquierda) */}
      <Nodo i={5} f={1} tipo="ctl" lineas={['Control I-PD', 'u = I − Kp·θ − Kd·d', '|u| ≤ 1,14 · anti-windup']}/>
      <Nodo i={4} f={1} tipo="dec" lineas={['¿Modo', 'automático?']}/>
      <Nodo i={3} f={1} tipo="proc" lineas={['Elegir motor', 'por el signo de u', 'V = Voff + Kv·|u|']}/>
      <Nodo i={2} f={1} tipo="dec" lineas={['¿Error > límite,', 'Habilitar OFF', 'o STOP?']}/>
      <Nodo i={1} f={1} tipo="proc" lineas={['PWM invertido', 'AO = 5 − V']}/>
      <Nodo i={0} f={1} tipo="io" lineas={['Escribir salidas', 'ao0 · line0 · line1']}/>
      <F d={`M${X(5)} ${Y[1] + H/2} L${X(4) + W + 8} ${Y[1] + H/2}`}/>
      <F d={`M${X(4) - 6} ${Y[1] + H/2} L${X(3) + W + 2} ${Y[1] + H/2}`} t="sí" tx={X(4) - 30} ty={Y[1] + H/2 - 8}/>
      <F d={`M${X(3)} ${Y[1] + H/2} L${X(2) + W + 8} ${Y[1] + H/2}`}/>
      <F d={`M${X(2) - 6} ${Y[1] + H/2} L${X(1) + W + 2} ${Y[1] + H/2}`} t="no" tx={X(2) - 30} ty={Y[1] + H/2 - 8}/>
      <F d={`M${X(1)} ${Y[1] + H/2} L${X(0) + W + 2} ${Y[1] + H/2}`}/>
      {/* ramas bajo la fila 2 */}
      <rect x={X(4)} y={330} width={W} height={46} rx="6" fill="#121212" stroke="#8f8c87" strokeWidth="1.2"/>
      <text x={cx(4)} y={350} fill="#f0eee9" fontSize="12" fontWeight="600" fontFamily="Inter, sans-serif" textAnchor="middle">Manual</text>
      <text x={cx(4)} y={366} fill="#a9a6a0" fontSize="11" fontFamily="Inter, sans-serif" textAnchor="middle">V = Vman · motor elegido</text>
      <F d={`M${cx(4)} ${Y[1] + H + 6} L${cx(4)} 328`} t="no" tx={cx(4) + 6} ty={Y[1] + H + 22}/>
      <F d={`M${X(4)} 353 L${cx(2)} 353 L${cx(2)} ${Y[1] + H + 8}`}/>
      <rect x={X(1) - 10} y={330} width={W + 20} height={46} rx="6" fill="#121212" stroke="#c8372d" strokeWidth="1.2"/>
      <text x={cx(1)} y={350} fill="#f0eee9" fontSize="12" fontWeight="600" fontFamily="Inter, sans-serif" textAnchor="middle">Apagar motores</text>
      <text x={cx(1)} y={366} fill="#a9a6a0" fontSize="11" fontFamily="Inter, sans-serif" textAnchor="middle">V = 0 · líneas en 0 · I = 0</text>
      <F d={`M${cx(2)} ${Y[1] + H + 6} L${cx(2)} 318 L${cx(1) + 30} 318 L${cx(1) + 30} 328`} t="sí" tx={cx(2) + 6} ty={Y[1] + H + 22}/>
      <F d={`M${X(1) - 10} 353 L${cx(0)} 353 L${cx(0)} ${Y[1] + H + 2}`}/>
      {/* fila 3 */}
      <F d={`M${X(0) + 20} ${Y[1] + H} L${X(0) + 20} ${Y[2] - 2}`}/>
      <Nodo i={0} f={2} tipo="proc" lineas={['Esperar 1 ms', 'ciclo real ≈ 6,6 ms']}/>
      <Nodo i={1} f={2} tipo="dec" lineas={['¿STOP?']}/>
      <Nodo i={2} f={2} tipo="fin" lineas={['Fin', 'salidas a 0 V']}/>
      <F d={`M${X(0) + W} ${Y[2] + H/2} L${X(1) - 8} ${Y[2] + H/2}`}/>
      <F d={`M${X(1) + W + 6} ${Y[2] + H/2} L${X(2) - 2} ${Y[2] + H/2}`} t="sí" tx={X(1) + W + 10} ty={Y[2] + H/2 - 8}/>
      {/* vuelta al inicio del ciclo */}
      <path d={`M${cx(1)} ${Y[2] - 6} L${cx(1)} 410 L${X(6) - 10} 410 L${X(6) - 10} 12 L${cx(2)} 12 L${cx(2)} ${Y[0] - 2}`} stroke="#F46008" strokeWidth="1.4" strokeDasharray="5 4" fill="none" markerEnd="url(#fv)"/>
      <text x={cx(1) + 8} y={Y[2] - 14} fill="#E5B000" fontSize="11" fontFamily="Inter, sans-serif">no</text>
      <text x={X(3) + 20} y={404} fill="#F46008" fontSize="11.5" fontFamily="Inter, sans-serif">el ciclo se repite hasta pulsar STOP</text>
    </svg>
  );
};

/* Máquina de estados del swing up (selector MODO DE ARRANQUE del VI) */
const EstadosSwing = () => {
  const N = ({ x, y, w = 190, h = 74, c, t, s1, s2 }) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill="#121212" stroke={c} strokeWidth="1.8"/>
      <text x={x + w / 2} y={y + 26} fill="#f0eee9" fontSize="14" fontWeight="700" fontFamily="Inter, sans-serif" textAnchor="middle">{t}</text>
      <text x={x + w / 2} y={y + 46} fill="#a9a6a0" fontSize="11.5" fontFamily="Inter, sans-serif" textAnchor="middle">{s1}</text>
      {s2 && <text x={x + w / 2} y={y + 62} fill="#a9a6a0" fontSize="11.5" fontFamily="Inter, sans-serif" textAnchor="middle">{s2}</text>}
    </g>
  );
  const A = ({ d, t, tx, ty, c = '#8a8a8a' }) => (<g><path d={d} stroke={c} strokeWidth="1.5" fill="none" markerEnd="url(#fsw)"/>{t && <text x={tx} y={ty} fill="#E5B000" fontSize="11.5" fontFamily="Inter, sans-serif" textAnchor="middle">{t}</text>}</g>);
  return (
    <svg viewBox="0 0 1000 300" style={{ width:'100%', minWidth:760, display:'block' }} role="img" aria-label="Máquina de estados del swing up: sube, planea, sostiene y no despegó">
      <defs><marker id="fsw" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#8a8a8a"/></marker></defs>
      <rect x={10} y={108} width={110} height={44} rx={22} fill="#121212" stroke="#3ddc84" strokeWidth="1.6"/>
      <text x={65} y={128} fill="#f0eee9" fontSize="13" fontWeight="700" fontFamily="Inter, sans-serif" textAnchor="middle">Run</text>
      <text x={65} y={143} fill="#a9a6a0" fontSize="10.5" fontFamily="Inter, sans-serif" textAnchor="middle">en un tope</text>
      <N x={170} y={93} c="#F46008" t="0 · Sube" s1="empuje máximo hacia" s2="la vertical (AO = 0 V)"/>
      <N x={470} y={93} c="#4A9EFF" t="1 · Planea" s1="motores apagados:" s2="sigue por inercia"/>
      <N x={770} y={93} c="#3ddc84" t="2 · Sostiene" s1="I-PD normal" s2="(como en Vertical)"/>
      <N x={170} y={222} h={58} c="#c8372d" t="3 · No despegó" s1="motores apagados hasta otro Run"/>
      <A d="M120 130 L166 130"/>
      <A d="M360 116 L466 116" t="|θ| ≤ corte (45°)" tx={413} ty={106}/>
      <A d="M470 150 C 430 182, 400 182, 362 150" t="se devuelve" tx={416} ty={190}/>
      <A d="M660 130 L766 130" t="|θ| ≤ 12°" tx={713} ty={120}/>
      <A d="M865 93 C 840 20, 300 20, 266 89" t="se aleja más de 35° → vuelve a subir" tx={565} ty={36}/>
      <A d="M265 167 L265 218" t="1,5 s sin despegar" tx={330} ty={198}/>
    </svg>
  );
};

/* Descargas. En la vista de claude.ai las descargas están bloqueadas: ahí se muestra un aviso. */
const Descargas = () => {
  const enClaude = !!window.SITIO_EN_CLAUDE;
  const grupos = [
    ['Código de control', [
      ['VI para LabVIEW 2021', 'assets/descargas/control_aeropendulo_LabVIEW2021.vi', 'vi'],
      ['VI para LabVIEW 2020', 'assets/descargas/control_aeropendulo_LabVIEW2020.vi', 'vi'],
      ['Formula Node (texto)', 'assets/descargas/formula_node.txt'],
      ['Programa de control externo de 2 ms (PowerShell + C#)', 'assets/descargas/control_externo_ps1.txt'],
      ['Swing up con el programa externo (PowerShell + C#)', 'assets/descargas/swing_up_ps1.txt'],
      ['Script de los ensayos de escalón', 'assets/descargas/ensayo_escalon_ps1.txt'],
    ]],
    ['Datos medidos', [
      ['Resumen de las 8 pruebas (.csv)', 'assets/descargas/resumen_pruebas.csv'],
      ['Los 42 ensayos de ternas (.csv, para Excel)', 'assets/descargas/historial_ternas_PID.csv'],
      ['Registro de la prueba final, a 2 ms (.csv)', 'assets/descargas/registros/lazo_prueba8_Kv0.6_filtro5ms_FINAL.csv'],
      ['Registro de la prueba 1, antes del ajuste (.csv)', 'assets/descargas/registros/lazo_prueba1_Kp2_Kd0.9_Kv3.5_filtro20ms.csv'],
      ['Swing up desde el tope izquierdo (.csv)', 'assets/descargas/registros/swingup_intento2_19nov.csv'],
      ['Swing up desde el tope derecho (.csv)', 'assets/descargas/registros/swingup_intento1_19nov.csv'],
      ['Gráfica del VI exportada desde LabVIEW (.txt)', 'assets/descargas/registros/VI_prueba_19nov_exportado_de_grafica.txt'],
      ['Ensayo de escalón, motor izquierdo a AO 3 V (.csv)', 'assets/descargas/registros/escalon_motor_izquierdo_AO3.0V.csv'],
    ]],
  ];
  return (
    <div className="reveal g2-tight" style={{ marginTop:2 }}>
      {grupos.map(([t, items]) => (
        <div key={t} style={{ background:'#0b0b0b', border:'1px solid #1c1c1c', padding:'20px 22px' }}>
          <h3 style={{ fontSize:17, fontWeight:700, marginBottom:12 }}>{t}</h3>
          <ul style={{ listStyle:'none', margin:0, padding:0, display:'grid', gap:8 }}>
            {items.filter(([, , k]) => !(enClaude && k === 'vi')).map(([n, href]) => (
              <li key={href}>
                <a href={href} download style={{ display:'flex', justifyContent:'space-between', gap:12, padding:'10px 12px', border:'1px solid #262626', color:'var(--white)', textDecoration:'none', fontSize:14.5 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--red)'} onMouseLeave={e => e.currentTarget.style.borderColor = '#262626'}>
                  <span>{n}</span><span style={{ color:'var(--red)' }}>↓</span>
                </a>
              </li>
            ))}
          </ul>
          {enClaude && t === 'Código de control' && (
            <p style={{ fontSize:13, color:'var(--g1)', lineHeight:1.6, marginTop:12 }}>En esta vista de claude.ai el navegador no deja descargar archivos ni publicar el .vi. El código del Formula Node se puede copiar más abajo; el VI completo se entrega con el proyecto.</p>
          )}
        </div>
      ))}
    </div>
  );
};

/* Bloque desplegable para lo detallado */
const Desplegable = ({ titulo, children }) => (
  <details className="reveal" style={{ marginTop:2, background:'#0b0b0b', border:'1px solid #1c1c1c' }}>
    <summary style={{ cursor:'pointer', padding:'16px 22px', fontSize:16, fontWeight:700, listStylePosition:'inside' }}>{titulo}</summary>
    <div style={{ padding:'0 22px 20px', overflowX:'auto' }}>{children}</div>
  </details>
);

const SoftwareSection = () => {
  const { useState, useEffect } = React;
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState('');
  useEffect(() => { fetch('assets/labview/codigo_formula_node_final.txt').then(r => r.text()).then(t => setCode(t.replace(/^﻿/, ''))).catch(() => {}); }, []);
  const copy = () => {
    try { navigator.clipboard.writeText(code).then(() => setCopied('Copiado'), () => setCopied('Selecciona el texto y cópialo')); }
    catch (e) { setCopied('Selecciona el texto y cópialo'); }
    setTimeout(() => setCopied(''), 2200);
  };
  const daq = [
    ['DAQ Assistant 2', 'Entrada de contador', 'ctr0 · Angular Encoder · X4 · 2000 P/R · grados', 'A = PFI8 · B = PFI10'],
    ['DAQ Assistant', 'Salida analógica', 'ao0 · 0 a 5 V (borne 12)', 'entrada del comparador LM324'],
    ['DAQ Assistant 3', 'Salida digital', 'port0/line0 (44) · port0/line1 (45)', 'motor derecho · motor izquierdo (L298N)'],
  ];
  const uso = [
    'Abrir el VI (LabVIEW 2021 o 2020). En otro computador, cambiar Dev10 por el nombre que muestre NI MAX en los 3 DAQ Assistant.',
    'Cerrar el Test Panel de NI MAX; si queda abierto, las líneas quedan tomadas (error −50103).',
    'Generador de onda: diente de sierra de 0 a 5 V (5 Vpp con offset 2,5 V), 100 Hz y Symmetry 100 %. Con offset 0 V la AO ya no gradúa el empuje.',
    'Elegir el Modo de arranque. Vertical: sostener la varilla derecha, dar Run y soltarla suave (el cero queda donde esté).',
    'Swing up desde el tope izquierdo o derecho: dejar la varilla quieta en ESE tope, manos lejos de las hélices, y dar Run. Sube sola y queda sostenida.',
    'Habilitar motores y Modo automático en ON. Si el estado del swing up marca 3, no despegó: casi siempre es el lado equivocado.',
    'Para apagar, poner primero Habilitar motores en OFF y luego STOP.',
  ];
  const noFunciono = [
    ['Integral siempre activa con recorte', 'peor: ±15–30°'],
    ['Los dos motores girando suave en reposo (Vr)', 'sin mejora'],
    ['Límite de voltaje según el ángulo (Vc)', 'peor: ±15–20°'],
    ['PWM por software con pulsos (Vp)', 'sin mejora: ±15–25°'],
    ['Vmax 1,2 con Kv 8', 'no se recupera desde 30°'],
  ];
  const td = { padding:'9px 10px', borderBottom:'1px solid #181818', fontSize:14, color:'#c9c6c1' };

  return (
    <section id="software" className="s-pad" style={{ background:'var(--bg2)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <SectionHead num="06" title="El VI de LabVIEW">
          El control corre en un VI con tres DAQ Assistant y un Formula Node que tiene todo el algoritmo (LabVIEW 2020 y 2021). Usa Kp = 2, Ki = 0,4, Kd = 0,9 y Kv = 0,6,
          con el derivativo filtrado a 5 ms y un ciclo de 6,6 ms. Un selector elige cómo arrancar: sosteniéndola en la vertical o con swing up desde cualquiera de los dos topes.
        </SectionHead>

        <div className="reveal" style={{ background:'#0b0b0b', border:'1px solid #1c1c1c', padding:'22px clamp(14px,2vw,26px)', overflowX:'auto' }}>
          <h3 style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>Qué hace el programa en cada ciclo</h3>
          <p style={{ fontSize:14, color:'#a9a6a0', marginBottom:16 }}>Azul: lectura y escritura en la DAQ · gris: cálculo · naranja: control · amarillo: decisión.</p>
          <FlujoVI/>
        </div>

        <div className="reveal" style={{ marginTop:2, background:'#0b0b0b', border:'1px solid #1c1c1c', padding:'22px clamp(14px,2vw,26px)', overflowX:'auto' }}>
          <h3 style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>Swing up: cómo sube sola desde el tope</h3>
          <p style={{ fontSize:14, color:'#a9a6a0', marginBottom:16, maxWidth:820 }}>Con Modo de arranque en tope izquierdo o derecho, el VI fija la vertical desde el tope medido con el encoder (−70,7° o +69,85°) y, después del I-PD, esta máquina de estados decide qué sale a los motores. El estado se guarda en la parte decimal del tiempo para no agregar otro nodo de realimentación.</p>
          <EstadosSwing/>
        </div>

        <div className="reveal g2-tight" style={{ marginTop:2 }}>
          <figure className="fig-card" style={{ margin:0 }}>
            <img src="assets/final/VI_panel_frontal_19nov.png" alt="Panel frontal final del VI: a la izquierda el modo de arranque, los botones y las perillas del PID; al centro las dos gráficas; a la derecha el medidor de ángulo, los indicadores y los ajustes" loading="lazy"/>
            <figcaption className="fig-cap">Panel frontal final: a la izquierda el Modo de arranque, los botones y las perillas del PID; al centro las gráficas con la banda de ±2°; a la derecha el medidor, el estado del swing up y los ajustes (Kv, Voff, Vmax, ángulo límite, corte).</figcaption>
          </figure>
          <figure className="fig-card" style={{ margin:0 }}>
            <img src="assets/final/VI_diagrama_bloques.png" alt="Diagrama de bloques del VI con los DAQ Assistant y el Formula Node" loading="lazy"/>
            <figcaption className="fig-cap">Diagrama de bloques: DAQ Assistant del encoder, Formula Node con nodos de realimentación y salidas analógica y digital, dentro de un While Loop con Wait de 1 ms.</figcaption>
          </figure>
        </div>

        <div className="reveal" style={{ marginTop:2, background:'#0b0b0b', border:'1px solid #1c1c1c', padding:'20px 22px' }}>
          <h3 style={{ fontSize:17, fontWeight:700, marginBottom:10 }}>Cómo usarlo</h3>
          <ol style={{ margin:0, paddingLeft:20, color:'#c9c6c1', fontSize:14.5, lineHeight:1.8 }}>{uso.map(u => <li key={u}>{u}</li>)}</ol>
        </div>

        <Descargas/>

        <Desplegable titulo="Ver el código del Formula Node">
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:10 }}>
            <button onClick={copy} style={{ fontSize:13.5, padding:'8px 14px', border:'1px solid var(--red)', background:'transparent', color:'var(--red)', cursor:'pointer' }}>{copied || 'Copiar código'}</button>
          </div>
          <pre style={{ margin:0, maxHeight:420, overflow:'auto', fontFamily:'var(--mono)', fontSize:12, lineHeight:1.55, color:'#d8d4ce', whiteSpace:'pre' }}>{code || 'Cargando…'}</pre>
        </Desplegable>

        <Desplegable titulo="Configuración de los DAQ Assistant">
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:620 }}>
            <thead><tr>{['Bloque', 'Tarea', 'Canal y escala', 'Conexión física'].map(h => <th key={h} style={{ ...td, color:'var(--g1)', fontWeight:600, textAlign:'left' }}>{h}</th>)}</tr></thead>
            <tbody>{daq.map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} style={td}>{c}</td>)}</tr>)}</tbody>
          </table>
          <p style={{ fontSize:13.5, color:'var(--g1)', marginTop:12 }}>Valores guardados: Kp 2 · Ki 0,4 · Kd 0,9 · Kv 0,6 · Voff 0,2 V · Vmax 5 V · ángulo límite 90°. Modo automático, Invertir sentido y PWM invertido en ON. Modo de arranque Vertical y corte de 45°.</p>
        </Desplegable>

        <Desplegable titulo="Lo que probamos y no funcionó">
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <tbody>{noFunciono.map(([a, b]) => <tr key={a}><td style={td}>{a}</td><td style={{ ...td, textAlign:'right' }}>{b}</td></tr>)}</tbody>
          </table>
          <p style={{ fontSize:13.5, color:'var(--g1)', marginTop:12 }}>Quedaron en el VI con valor 0, sin efecto, como registro del proceso.</p>
        </Desplegable>
      </div>
    </section>
  );
};
Object.assign(window, { SoftwareSection, FlujoVI, EstadosSwing, Desplegable });
