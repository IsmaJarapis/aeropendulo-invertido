const TeamSection = () => {
  const team = [
    ['Ismael Jaramillo Marulanda', 'IJ'],
    ['Samuel Bermudez Echeverri', 'SB'],
    ['Daniel Correa Osorio', 'DC'],
  ];
  return (
    <section id="team" className="s-pad" style={{ background:'var(--bg)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <SectionHead num="10" title="Equipo"/>
        <div className="g3 reveal" style={{ marginBottom:2 }}>
          {team.map(([name, ini]) => (
            <div key={name} style={{ background:'#0a0a0a', border:'1px solid #1a1a1a', padding:'clamp(22px,3vw,32px)', display:'flex', gap:18, alignItems:'center' }}>
              <div style={{ width:64, height:64, flexShrink:0, borderRadius:'50%', border:'2px solid var(--red)', display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:"'Bebas Neue', var(--sans)", fontSize:26, letterSpacing:1, boxShadow:'0 0 0 6px rgba(244,96,8,0.08)' }}>{ini}</div>
              <div>
                <div style={{ fontFamily:'var(--sans)', fontWeight:700, fontSize:16, marginBottom:4 }}>{name}</div>
                <div style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--red)', letterSpacing:0.4, textTransform:'uppercase' }}>Ingeniería Física</div>
              </div>
            </div>
          ))}
        </div>
        <div className="reveal" style={{ background:'#0d0f14', border:'1px solid #1a1a1a', padding:'clamp(24px,3vw,40px)' }}>
          <div style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--g2)', letterSpacing:0.4, marginBottom:16 }}>ACERCA DEL PROYECTO</div>
          <p style={{ fontSize:'clamp(12px,1.5vw,14px)', lineHeight:1.8, color:'var(--g1)', maxWidth:860, marginBottom:20 }}>
            Proyecto de materia de Proyecto Instrumental 1 (2026-2), Escuela de Ciencias Aplicadas e Ingeniería. El aeropéndulo invertido integra
            mecánica, electrónica, adquisición de datos y control digital en una misma planta, y se acompaña de este gemelo digital para diseñar
            el control antes de probarlo y comparar después la respuesta real con la simulada. Continúa el trabajo del aeropéndulo AERO-COPTER del semestre anterior.
          </p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {['Ingeniería Física','Universidad EAFIT','Medellín','2026-2'].map(t => (
              <div key={t} style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--g2)', border:'1px solid #222', padding:'4px 10px', letterSpacing:1 }}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const FooterSection = () => (
  <footer style={{ background:'#080808', borderTop:'1px solid #1a1a1a', padding:'clamp(40px,5vw,64px) clamp(20px,5vw,80px) 36px' }}>
    <div style={{ maxWidth:1200, margin:'0 auto' }}>
      <div className="g4-footer">
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
            <BrandIcon size={28}/>
            <div style={{ fontFamily:'var(--sans)', fontWeight:700, fontSize:11, letterSpacing:0.4, color:'var(--white)' }}>JARAPIS LAB</div>
          </div>
          <p style={{ fontFamily:'var(--sans)', fontSize:13, color:'var(--g2)', lineHeight:1.7, maxWidth:260, marginBottom:18 }}>Plantas físicas, simulación y gemelos digitales para aprender control.</p>
          <div style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--g2)', lineHeight:1.6 }}>Universidad EAFIT<br/>Proyecto Instrumental 1 · 2026-2</div>
        </div>
        {[
          ['Proyecto', [['Problema','#overview'],['Instrumentación','#specs'],['Modelo','#model'],['Resultados','#results']]],
          ['Gemelo digital', [['Simulador','simulador.html'],['Software LabVIEW','#software'],['Medios','#media']]],
          ['Documentación', [['Manual de usuario','manual.html'],['Esquema electrónico','#docs'],['Planos','#docs']]],
        ].map(([col, items]) => (
          <div key={col}>
            <div style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--g2)', letterSpacing:0.4, marginBottom:18, textTransform:'uppercase' }}>{col}</div>
            {items.map(([l, h]) => (
              <div key={l} style={{ marginBottom:9 }}>
                <a href={h} style={{ fontFamily:'var(--sans)', fontSize:13, color:'var(--g2)', textDecoration:'none' }}
                  onMouseEnter={e=>e.target.style.color='var(--white)'} onMouseLeave={e=>e.target.style.color='var(--g2)'}>{l}</a>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ borderTop:'1px solid #151515', paddingTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--g2)' }}>© 2026 JARAPIS LAB · Universidad EAFIT — Proyecto Instrumental 1.</div>
        <div style={{ fontFamily:'var(--mono)', fontSize:12, color:'#333', letterSpacing:0.4 }}>AEROPÉNDULO INVERTIDO / AP-INV-2026</div>
      </div>
    </div>
  </footer>
);

Object.assign(window, { TeamSection, FooterSection });
