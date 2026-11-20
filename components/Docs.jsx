const DocsSection = () => {
  const [lightbox, setLightbox] = React.useState(null);

  const DocIcon = () => (<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect x="6" y="3" width="20" height="26" rx="2" stroke="#F46008" strokeWidth="1.5"/><path d="M10 10 h12 M10 15 h12 M10 20 h8" stroke="#F46008" strokeWidth="1.2" strokeLinecap="round"/><path d="M22 3 v6 h6" stroke="#F46008" strokeWidth="1.2"/></svg>);
  const CircuitIcon = () => (<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect x="12" y="12" width="12" height="12" rx="1" stroke="#F46008" strokeWidth="1.5"/><line x1="18" y1="4" x2="18" y2="12" stroke="#F46008" strokeWidth="1.2"/><line x1="18" y1="24" x2="18" y2="32" stroke="#F46008" strokeWidth="1.2"/><line x1="4" y1="18" x2="12" y2="18" stroke="#F46008" strokeWidth="1.2"/><line x1="24" y1="18" x2="32" y2="18" stroke="#F46008" strokeWidth="1.2"/><circle cx="18" cy="4" r="2" fill="#F46008"/><circle cx="18" cy="32" r="2" fill="#F46008"/><circle cx="4" cy="18" r="2" fill="#F46008"/><circle cx="32" cy="18" r="2" fill="#F46008"/></svg>);
  const BlueprintIcon = () => (<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect x="4" y="4" width="28" height="28" rx="2" stroke="#F46008" strokeWidth="1.5"/><line x1="4" y1="13" x2="32" y2="13" stroke="#F46008" strokeWidth="0.8" strokeDasharray="2 2"/><line x1="4" y1="22" x2="32" y2="22" stroke="#F46008" strokeWidth="0.8" strokeDasharray="2 2"/><line x1="13" y1="4" x2="13" y2="32" stroke="#F46008" strokeWidth="0.8" strokeDasharray="2 2"/><line x1="22" y1="4" x2="22" y2="32" stroke="#F46008" strokeWidth="0.8" strokeDasharray="2 2"/><rect x="14" y="13" width="9" height="9" stroke="#F46008" strokeWidth="1.5" fill="none"/></svg>);

  const docs = [
    { icon:<DocIcon/>, tag:'HTML · imprimible a PDF', title:'Manual de usuario',
      desc:'Seguridad, componentes, conexiones de la DAQ y del puente H, encendido, operación del VI, calibración del cero, solución de problemas y uso del gemelo digital.',
      btn:'Abrir manual ↗', onClick:() => setLightbox('manual'), primary:true },
    { icon:<CircuitIcon/>, tag:'Conexiones del VI', title:'Esquema de conexiones',
      desc:'DAQ NI USB-6212 (ao0, port0/line0-1, ctr0 en PFI8 y PFI10), comparador LM324 con la sierra de 100 Hz, PWM invertido, puente H L298N y motores, con la explicación interactiva del PWM.',
      btn:'Ver electrónica →', onClick:() => { const el = document.getElementById('electronica'); if (el) el.scrollIntoView({ behavior:'smooth' }); } },
    { icon:<BlueprintIcon/>, tag:'Planos generales', title:'Planos estructurales',
      desc:'Cotas generales del mástil y la varilla: varilla de 250 mm, mástil de 153 mm, base de 80 mm y altura total de 430,57 mm.',
      btn:'Ver planos →', onClick:() => setLightbox('assets/planos.png') },
  ];

  return (
    <section id="docs" className="s-pad" style={{ background:'var(--bg2)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <SectionHead num="09" title="Documentación"/>
        <div className="g3">
          {docs.map((d, i) => (
            <div key={i} className={`reveal reveal-delay-${i + 1}`} style={{ background:'#0a0a0a', border:'1px solid #1a1a1a', padding:'clamp(24px,3vw,36px)', display:'flex', flexDirection:'column', transition:'border-color 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#F46008'} onMouseLeave={e=>e.currentTarget.style.borderColor='#1a1a1a'}>
              <div style={{ marginBottom:18 }}>{d.icon}</div>
              <div style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--g2)', letterSpacing:0.4, marginBottom:10, textTransform:'uppercase' }}>{d.tag}</div>
              <div style={{ fontFamily:'var(--sans)', fontWeight:700, fontSize:'clamp(16px,2vw,20px)', marginBottom:14, letterSpacing:-0.5 }}>{d.title}</div>
              <div style={{ fontFamily:'var(--sans)', fontSize:'clamp(12px,1.5vw,13px)', color:'var(--g1)', lineHeight:1.7, marginBottom:28, flex:1 }}>{d.desc}</div>
              <button onClick={d.onClick} style={{ padding:'10px 18px', fontSize:11, fontWeight:600, letterSpacing:0.4, fontFamily:'var(--sans)', cursor:'pointer',
                background: d.primary ? 'var(--red)' : 'transparent', color: d.primary ? '#fff' : 'var(--white)', border: d.primary ? '1px solid var(--red)' : '1px solid #333' }}>{d.btn}</button>
            </div>
          ))}
        </div>
      </div>

      {lightbox === 'manual' && (
        <div onClick={() => setLightbox(null)} style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(8,8,8,0.96)', display:'flex', flexDirection:'column', padding:'56px 12px 12px' }}>
          <div onClick={e => e.stopPropagation()} style={{ position:'absolute', top:12, left:0, right:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', gap:12 }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--g1)', letterSpacing:0.4 }}>MANUAL DE USUARIO</div>
            <div style={{ display:'flex', gap:8 }}>
              <a href="manual.html" target="_blank" rel="noopener" style={{ fontFamily:'var(--mono)', fontSize:11, color:'#fff', letterSpacing:0.4, border:'1px solid #444', padding:'8px 14px', textDecoration:'none' }}>NUEVA PESTAÑA ↗</a>
              <button onClick={() => setLightbox(null)} style={{ fontFamily:'var(--mono)', fontSize:11, color:'#fff', letterSpacing:0.4, border:'1px solid #444', padding:'8px 14px', background:'none', cursor:'pointer' }}>CERRAR ✕</button>
            </div>
          </div>
          <iframe src="manual.html" title="Manual de usuario" onClick={e => e.stopPropagation()} style={{ width:'100%', height:'100%', maxWidth:1000, margin:'0 auto', border:'1px solid #222', background:'#5b6068' }}/>
        </div>
      )}
      {lightbox && lightbox !== 'manual' && (
        <div onClick={() => setLightbox(null)} style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(8,8,8,0.94)', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 16px', cursor:'zoom-out' }}>
          <div style={{ position:'absolute', top:16, right:16, fontFamily:'var(--mono)', fontSize:11, color:'#fff', letterSpacing:0.4, border:'1px solid #444', padding:'8px 14px' }}>CERRAR ✕</div>
          <img src={lightbox} alt="Documento ampliado" onClick={e => e.stopPropagation()} style={{ maxWidth:'100%', maxHeight:'88vh', objectFit:'contain', background:'#fff', cursor:'default' }}/>
        </div>
      )}
    </section>
  );
};
Object.assign(window, { DocsSection });
