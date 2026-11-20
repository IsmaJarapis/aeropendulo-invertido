const HeroSection = () => {
  const stats = [
    ['±2°', 'Objetivo en la vertical'],
    ['0,88°', 'Error rms final'],
    ['99 %', 'Del tiempo en ±2°'],
    ['0,57 s', 'Swing up: del tope a la vertical'],
  ];

  return (
    <section id="hero" style={{ display:'flex', flexDirection:'column', justifyContent:'center', padding:'120px 24px 90px', position:'relative', overflow:'hidden' }}>
      <div className="hero-grid" style={{ padding:'0 max(0px, calc((100% - 1400px)/2))' }}>
        <div>
          <div style={{ fontFamily:'var(--sans)', fontSize:14, color:'var(--red)', fontWeight:600, marginBottom:18 }}>Instrumental 1 · Universidad EAFIT · 2026-2</div>
          <div className="hero-title" style={{ fontFamily:"'Bebas Neue', var(--sans)", fontSize:'clamp(60px,9vw,128px)', lineHeight:0.88, letterSpacing:2 }}>
            <span style={{ color:'var(--white)' }}>AEROPÉNDULO</span><br/><span style={{ color:'var(--red)' }}>INVERTIDO</span>
          </div>
          <p style={{ fontSize:'clamp(15px,1.6vw,17px)', lineHeight:1.7, color:'#b3b0aa', maxWidth:520, margin:'26px 0 32px' }}>
            Una varilla de 25 cm que sube sola desde el tope y se sostiene en la vertical con dos hélices y un control I-PD en LabVIEW.
            En la planta real quedó con 0,88° de error rms y el 99 % del tiempo dentro de ±2°. Aquí están el modelo, el código, las mediciones y un gemelo digital para probarlo.
          </p>

          <div className="g4-stats">
            {stats.map(([val, label], i) => (
              <div key={i} style={{ padding:'16px 12px', borderRight:i<3?'1px solid #1e1e1e':'none', background:'#0a0a0a' }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:'clamp(14px,1.6vw,17px)', fontWeight:600, color:'var(--white)', marginBottom:5 }}>{val}</div>
                <div style={{ fontFamily:'var(--sans)', fontSize:12.5, color:'#8f8c86' }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <a href="simulador.html" style={{ padding:'11px 24px', background:'var(--red)', color:'#fff', textDecoration:'none', fontWeight:600, fontSize:14, fontFamily:'var(--sans)' }}
              onMouseEnter={e=>e.currentTarget.style.opacity='0.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}
            >Abrir el gemelo digital</a>
            <a href="#entrenamiento" style={{ padding:'11px 24px', border:'1px solid var(--red)', color:'var(--white)', textDecoration:'none', fontWeight:600, fontSize:14, fontFamily:'var(--sans)' }}>Ver cómo encontramos la terna</a>
            <a href="manual.html" style={{ padding:'11px 24px', border:'1px solid #333', color:'var(--g1)', textDecoration:'none', fontWeight:500, fontSize:14, fontFamily:'var(--sans)', transition:'all 0.2s' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='#fff'; e.currentTarget.style.color='#fff'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='#333'; e.currentTarget.style.color='var(--g1)'; }}
            >Manual de usuario</a>
          </div>
        </div>

        <div className="hero-svg-wrap" style={{ display:'flex', justifyContent:'center', alignItems:'center', position:'relative' }}>
          <img src="assets/render/hero_ensamblaje.png" alt="Render del ensamblaje del aeropéndulo invertido con los colores de SolidWorks: péndulo, caja electrónica, DAQ y generador de onda"
            style={{ width:'100%', maxWidth:620, height:'auto', display:'block', filter:'drop-shadow(0 24px 40px rgba(0,0,0,0.5))' }}/>
        </div>
      </div>

    </section>
  );
};

Object.assign(window, { HeroSection });
