const SpecsSection = () => {
  const rows = [
    { param:'Varilla (3)',                 value:'250 mm · fibra de carbono tubular · 3,5 g', note:'ruteo interno del cableado', kind:'A' },
    { param:'Brazo del empuje Lm',         value:'0,255 m',                               note:'pivote → eje de los motores', kind:'C' },
    { param:'Momento de inercia I',        value:'1,14 × 10⁻³ kg·m²',                    note:'calculado con masas medidas', kind:'C' },
    { param:'Rigidez gravitacional K',     value:'0,0461 N·m/rad',                        note:'calculado (término inestable)', kind:'C' },
    { param:'Motores DC con hélice (7, 8)', value:'2 × 3,7 V nominal · hélice 55 mm',     note:'uno encendido a la vez · PWM desde la AO', kind:'A' },
    { param:'Curva de empuje',             value:'F = 6,83·10⁻³ V² + 8,19·10⁻³ V  [N]',   note:'anemómetro · R² = 0,997', kind:'M' },
    { param:'Torque de un motor',          value:'17–20 mN·m al mínimo · 44–47 mN·m saturado', note:'ensayos de escalón · el izquierdo ≈ 5 % más', kind:'M' },
    { param:'Constante del motor τm',      value:'0,02–0,04 s · retardo puro 0–0,02 s',   note:'ajuste J·θ″ = K·sin θ − Tm(t)', kind:'M' },
    { param:'Topes mecánicos',             value:'−70,7° (izq.) y +69,85° (der.)',        note:'medidos con el encoder; el swing up los usa para hallar la vertical', kind:'M' },
    { param:'Encoder óptico (5)',          value:'YUMO E6B2-CWZ3E · 2000 P/R',            note:'A → PFI8 · B → PFI10 · ctr0 en X4', kind:'A' },
    { param:'Resolución angular',          value:'0,045° por cuenta (X4)',                note:'8000 cuentas por vuelta', kind:'A' },
    { param:'DAQ (10)',                    value:'NI USB-6212 (Dev10)',                   note:'ao0 0–5 V · port0/line0-1 · ctr0', kind:'A' },
    { param:'Generador de onda (11)',      value:'Diente de sierra 0–5 V · 100 Hz',       note:'portadora del PWM analógico', kind:'A' },
    { param:'Modulación PWM',              value:'Comparador LM324',                      note:'PWM invertido: ciclo útil = 1 − V_AO / 5 V', kind:'C' },
    { param:'Etapa de potencia',           value:'Puente H L298N',                        note:'EN = PWM · line0 → motor derecho · line1 → izquierdo', kind:'A' },
    { param:'Alimentación',                value:'Fuente conmutada 12 V → regulador LM2596', note:'buck de 12 a 5 V', kind:'A' },
    { param:'Estructura (1, 2, 4, 6, 9)',  value:'Mástil con topes, base con canal, acople, soporte de motores, caja electrónica', note:'impresión 3D (PLA) y corte láser', kind:'C' },
    { param:'Software',                    value:'LabVIEW 2020/2021 + MATLAB/Simulink R2025b', note:'control, adquisición y simulación', kind:'A' },
    { param:'Control externo de ensayo',   value:'PowerShell + C# con DAQmx · lazo de 2 ms', note:'registro de cada ciclo en .csv', kind:'C' },
  ];
  const kinds = { A:['ADQUIRIDO','#4A9EFF'], C:['CONSTRUIDO','#F46008'], M:['MEDIDO','#15a5a0'] };

  /* Encoder en cuadratura: cómo se leen los dos canales */
  const Quad = () => {
    const per = 64, x0 = 70, n = 7;
    const wave = (y, sh) => { let d = `M${x0} ${y + 28}`; for (let i = 0; i < n; i++) { const a = x0 + i * per + sh; d += ` L${a} ${y + 28} L${a} ${y} L${a + per / 2} ${y} L${a + per / 2} ${y + 28}`; } return d + ` L${x0 + n * per + sh} ${y + 28}`; };
    return (
      <svg viewBox="0 0 560 250" width="100%" role="img" aria-label="Señales A y B del encoder desfasadas 90 grados y conteo X4">
        <rect width="560" height="250" fill="#0a0a0a"/>
        <text x="20" y="22" fill="#8a8a8a" fontFamily="JetBrains Mono, monospace" fontSize="11">ENCODER EN CUADRATURA · 2000 PULSOS POR VUELTA</text>
        <text x="20" y="64" fill="#f2c230" fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700">A</text>
        <path d={wave(46, 0)} fill="none" stroke="#f2c230" strokeWidth="2.4"/>
        <text x="20" y="124" fill="#19b3a6" fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700">B</text>
        <path d={wave(106, per / 4)} fill="none" stroke="#19b3a6" strokeWidth="2.4"/>
        {Array.from({ length: n * 4 }).map((_, i) => (
          <line key={i} x1={x0 + i * per / 4} y1="150" x2={x0 + i * per / 4} y2="162" stroke="#F46008" strokeWidth="2"/>
        ))}
        <text x="70" y="182" fill="#F46008" fontFamily="JetBrains Mono, monospace" fontSize="11">cada marca = un flanco = 1 cuenta (X4)</text>
        <text x="20" y="212" fill="#cfcfcf" fontFamily="Inter, sans-serif" fontSize="13">2000 ranuras × 4 flancos = 8000 cuentas por vuelta → 360° / 8000 = 0,045° por cuenta.</text>
        <text x="20" y="234" fill="#8a8a8a" fontFamily="Inter, sans-serif" fontSize="12">Si A cambia antes que B, el contador suma; si B va primero, resta. Así se sabe hacia dónde gira.</text>
      </svg>
    );
  };

  return (
    <section id="specs" className="s-pad" style={{ background:'var(--bg2)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <SectionHead num="02" title="Instrumentación">
          Qué compramos, qué construimos y qué medimos. Los números entre paréntesis son las piezas del ensamblaje. El torque de los motores, su constante de tiempo y los topes salen de nuestros ensayos; la fricción del pivote todavía no la hemos medido.
        </SectionHead>

        <div className="reveal" style={{ overflowX:'auto' }}>
          <div style={{ minWidth:340 }}>
            <div className="spec-header">
              {['Elemento / parámetro','Valor','Origen · notas'].map(h => (
                <span key={h} style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--red)', letterSpacing:0.4, textTransform:'uppercase' }}>{h}</span>
              ))}
            </div>
            {rows.map((r,i) => (
              <div key={i} className="spec-row" style={{ background: i%2===0 ? '#090909' : '#0c0c0c' }}
                onMouseEnter={e=>e.currentTarget.style.background='#1a130d'}
                onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'#090909':'#0c0c0c'}>
                <span style={{ fontFamily:'var(--sans)', fontSize:'clamp(11px,1.5vw,13px)', color:'var(--g1)' }}>{r.param}</span>
                <span style={{ fontFamily:'var(--mono)', fontSize:'clamp(11px,1.5vw,13px)', color:'var(--white)', fontWeight:500 }}>{r.value}</span>
                <span className="spec-note" style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--g2)' }}>
                  <b style={{ color:kinds[r.kind][1], fontWeight:600, marginRight:8 }}>{kinds[r.kind][0]}</b>{r.note}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="reveal" style={{ marginTop:28, display:'grid', gridTemplateColumns:'minmax(0,2.2fr) minmax(0,1fr)', gap:2 }} id="specs-parts">
          <figure className="fig-card" style={{ margin:0, background:'#f4f5f7' }}>
            <img src="assets/rotulos/rotulo_isometrica.jpg" alt="Vista isométrica del ensamblaje con las piezas numeradas del 1 al 11"/>
            <figcaption className="fig-cap" style={{ background:'#0a0a0a' }}>Identificación de piezas en el ensamblaje (vista isométrica). El frente del equipo es el lado del generador; el encoder va detrás del mástil.</figcaption>
          </figure>
          <div style={{ background:'#0a0a0a', border:'1px solid #1a1a1a', padding:'18px 20px' }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--red)', letterSpacing:0.4, marginBottom:12 }}>TABLA DE PIEZAS</div>
            {PARTS.map(([n, t]) => (
              <div key={n} style={{ display:'grid', gridTemplateColumns:'28px 1fr', gap:10, padding:'6px 0', borderBottom:'1px solid #161616', alignItems:'center' }}>
                <span style={{ fontFamily:'var(--mono)', fontSize:11, fontWeight:600, color:'#fff', background:'var(--red)', borderRadius:'50%', width:22, height:22, display:'inline-flex', alignItems:'center', justifyContent:'center' }}>{n}</span>
                <span style={{ fontFamily:'var(--sans)', fontSize:12.5, color:'var(--g1)' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="g2-tight reveal" style={{ marginTop:2 }}>
          <figure className="fig-card" style={{ margin:0, background:'#fff' }}>
            <img src="assets/calibracion_actuador.png" alt="Velocidad del aire y empuje estimado de los dos motores frente al voltaje, con barras de error"/>
            <figcaption className="fig-cap" style={{ background:'#0a0a0a' }}>Calibración del actuador: velocidad del aire medida con anemómetro (barras: resolución ±0,1 m/s) y empuje F = ρAv²,
              con ρ = 1,05 kg/m³ y hélice de 55 mm. Ajuste F = (6,83 ± 0,30)·10⁻³V² + (8,18 ± 0,82)·10⁻³V; a 3,5 V el motor 2 empuja ≈ 9 % más.</figcaption>
          </figure>
          <figure className="fig-card" style={{ margin:0 }}>
            <Quad/>
            <figcaption className="fig-cap">Cómo mide el ángulo el encoder YUMO E6B2-CWZ3E de 2000 P/R. En la planta se verificó el signo (varilla inclinada a la derecha, vista de frente: +45,6°)
              y el lazo final usa la escala nominal de 0,045° por cuenta.<br/><Pending>PENDIENTE: CURVA ÁNGULO MEDIDO VS. PATRÓN CON EL ENCODER NUEVO</Pending></figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
};
Object.assign(window, { SpecsSection });
