const MediaSection = () => {
  /* Figuras rotuladas y videos listados en assets/capturas.js (lo regenera tools/preparar_cad.py) */
  const caps = window.CAD_CAPTURAS || [];
  const videos = window.VIDEOS || [];
  const wide = caps.filter(c => c.wide), detail = caps.filter(c => !c.wide);
  const full = videos.find(v => v.main);
  const fotos = window.CAD_FOTOS || [];
  const clips = videos.filter(v => v !== full);

  const Tag = ({ children }) => (
    <div style={{ position:'absolute', top:12, left:12, fontFamily:'var(--mono)', fontSize:12, color:'#fff', background:'rgba(244,96,8,0.85)', padding:'4px 10px', letterSpacing:0.4, pointerEvents:'none', zIndex:2 }}>{children}</div>
  );
  const Video = ({ v, big }) => v.ok ? (
    <div style={{ position:'relative', border:'1px solid #1a1a1a', background:'#000' }}>
      <video src={v.file} controls playsInline preload="metadata" style={{ width:'100%', display:'block', aspectRatio:'16/9', objectFit:'contain', background:'#000' }}/>
      <Tag>{v.label.toUpperCase()}</Tag>
    </div>
  ) : (
    <div style={{ position:'relative', background:'#080808', border:'1px solid #1a1a1a', aspectRatio:'16/9', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:10, overflow:'hidden', padding:16 }}>
      <svg width={big ? 52 : 40} height={big ? 52 : 40} viewBox="0 0 52 52" fill="none" aria-hidden="true"><circle cx="26" cy="26" r="25" stroke="#F46008" strokeWidth="1.5"/><polygon points="22,16 40,26 22,36" fill="#F46008"/></svg>
      <div style={{ fontFamily:'var(--sans)', fontWeight:600, fontSize: big ? 15 : 12, textAlign:'center' }}>{v.label}</div>
      <div style={{ fontFamily:'var(--mono)', fontSize:12.5, color:'var(--g2)', textAlign:'center', wordBreak:'break-all' }}>{v.file}</div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'8px 14px', background:'linear-gradient(to top, rgba(0,0,0,0.75), transparent)', fontFamily:'var(--mono)', fontSize:12, color:'var(--g2)', letterSpacing:0.4 }}>VIDEO EN RENDERIZADO</div>
    </div>
  );

  return (
    <section id="media" className="s-pad" style={{ background:'var(--bg)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <SectionHead num="08" title="Videos">
          Primero, la planta real funcionando: la planta, las primeras pruebas, cómo se fue puliendo y el resultado final, con varias pruebas de vertical y de swing up desde los dos topes. Luego, el recorrido completo del boceto y el CAD a la construcción y la planta funcionando. Después, el video explicativo de cada componente, hecho con el ensamblaje de SolidWorks.
        </SectionHead>

        {full && <div className="reveal" style={{ marginBottom:2 }}><Video v={full} big/></div>}
        <div className="g3 reveal" style={{ marginBottom:2 }}>
          {clips.map(v => <Video key={v.file} v={v}/>)}
          <div style={{ position:'relative', border:'1px solid #1a1a1a', background:'#000' }}>
            <video src="assets/prototipo-video.mp4" controls playsInline preload="metadata" style={{ width:'100%', display:'block', aspectRatio:'16/9', objectFit:'contain', background:'#000' }}/>
            <Tag>PROTOTIPO · AVANCE 2</Tag>
          </div>
          <div style={{ position:'relative', border:'1px solid #1a1a1a', background:'#000' }}>
            <video src="assets/final/video_conexiones.mp4" controls playsInline preload="metadata" style={{ width:'100%', display:'block', aspectRatio:'16/9', objectFit:'contain', background:'#000' }}/>
            <Tag>CONEXIONES EN EL LABORATORIO</Tag>
          </div>
        </div>

        <div className="g2-tight reveal" style={{ marginBottom:2 }}>
          {fotos.map(c => (
            <figure key={c.src} style={{ margin:0, position:'relative', background:'#eef0f3', border:'1px solid #1a1a1a' }}>
              <img src={c.src} alt={`Render con los colores de SolidWorks: ${c.label}`} style={{ width:'100%', display:'block' }}/>
              <Tag>{c.label.toUpperCase()}</Tag>
            </figure>
          ))}
        </div>
        {wide.map(c => (
          <figure key={c.src} className="reveal" style={{ margin:'0 0 2px', position:'relative', background:'#f4f5f7', border:'1px solid #1a1a1a' }}>
            <img src={c.src} alt={`Ensamblaje con piezas numeradas: ${c.label}`} style={{ width:'100%', display:'block' }}/>
            <Tag>{c.label.toUpperCase()}</Tag>
          </figure>
        ))}
        <div className="g2-tight" style={{ marginBottom:2 }}>
          {detail.map(c => (
            <figure key={c.src} className="reveal" style={{ margin:0, position:'relative', background:'#f4f5f7', border:'1px solid #1a1a1a' }}>
              <img src={c.src} alt={`Detalle rotulado: ${c.label}`} style={{ width:'100%', display:'block' }}/>
              <Tag>{c.label.toUpperCase()}</Tag>
            </figure>
          ))}
        </div>
        <div className="reveal" style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--g2)', lineHeight:1.7, marginTop:12 }}>
          Piezas: {PARTS.map(([n, t]) => `${n} ${t}`).join(' · ')}.
        </div>
      </div>
    </section>
  );
};
Object.assign(window, { MediaSection });
