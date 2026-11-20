/* Botón simple para abrir una página embebida (gemelo o entrenamiento) */
const Embebido = ({ src, title, etiqueta, nota }) => {
  const [activo, setActivo] = React.useState(false);
  return (
    <div className="reveal" style={{ maxWidth:1200, margin:'0 auto', padding:'0 clamp(20px,5vw,80px)' }}>
      {activo ? (
        <iframe src={src} title={title} style={{ width:'100%', height:'clamp(560px, 86vh, 900px)', border:'1px solid #1f1f1f', display:'block', background:'var(--bg)' }}/>
      ) : (
        <button onClick={() => setActivo(true)} style={{
          width:'100%', minHeight:220, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12,
          background:'#0b0b0b', border:'1px solid #1f1f1f', color:'var(--white)', cursor:'pointer', fontFamily:'var(--sans)', padding:24,
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--red)'} onMouseLeave={e => e.currentTarget.style.borderColor = '#1f1f1f'}>
          <span style={{ width:58, height:58, borderRadius:'50%', border:'2px solid var(--red)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none"><polygon points="10,6 24,14 10,22" fill="#F46008"/></svg>
          </span>
          <span style={{ fontSize:17, fontWeight:700 }}>{etiqueta}</span>
          {nota && <span style={{ fontSize:13.5, color:'var(--g1)' }}>{nota}</span>}
        </button>
      )}
      <div style={{ display:'flex', justifyContent:'flex-end', marginTop:12 }}>
        <a href={src} target="_blank" rel="noopener" style={{ fontSize:13.5, color:'var(--red)', textDecoration:'none' }}>Abrir en pantalla completa ↗</a>
      </div>
    </div>
  );
};

const SimulatorSection = () => (
  <section id="simulator" style={{ background:'var(--bg2)', padding:'110px 0 70px' }}>
    <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 clamp(20px,5vw,80px)' }}>
      <SectionHead num="05" title="Gemelo digital">
        Es el mismo código del VI corriendo sobre el modelo de la planta, con los parámetros que medimos: motores casi todo/nada y su retardo,
        los topes, el período del lazo y la resolución del encoder. Puedes empujar la varilla con el mouse o el dedo y mover cualquier perilla del panel.
      </SectionHead>
      <div className="reveal" style={{ border:'1px solid #1f1f1f', background:'#000', marginBottom:28 }}>
        <video src="assets/videos/gemelo_en_uso.mp4" poster="assets/videos/gemelo_en_uso.jpg" controls playsInline preload="metadata"
          style={{ width:'100%', display:'block', aspectRatio:'16/9', background:'#000' }}/>
      </div>
    </div>
    <Embebido src="simulador.html" title="Gemelo digital del aeropéndulo invertido" etiqueta="Abrir el gemelo digital"
      nota="Incluye los escenarios “VI antes del ajuste” y “Control externo de 2 ms”"/>
  </section>
);

/* Cómo encontramos la terna PID: video de presentación + entrenamiento interactivo */
const TrainingSection = () => {
  const pasos = [
    ['Una población de ternas', 'En el gemelo corren 20 copias del aeropéndulo, cada una con una terna Kp, Ki, Kd distinta. Todas arrancan inclinadas y reciben un golpe a los 3 s.'],
    ['Las que fallan mueren', 'Se mide qué tan bien se sostuvo cada una. Las que se caen o se alejan mucho de la vertical salen de la población.'],
    ['Las mejores tienen hijos', 'Las cinco mejores son los padres de la siguiente generación: cada hijo es la terna de un padre con una pequeña mutación.'],
    ['La planta decide', 'El gemelo acota la región donde buscar. Los ensayos en el aeropéndulo real afinaron la terna hasta Kp 2 · Ki 0,4 · Kd 0,9.'],
  ];
  return (
    <section id="entrenamiento" style={{ background:'var(--bg)', padding:'110px 0 70px', borderTop:'1px solid #1a1a1a' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 clamp(20px,5vw,80px)' }}>
        <SectionHead num="05.1" title="Cómo encontramos la terna PID">
          Probamos un método de aprendizaje autónomo, un algoritmo evolutivo, junto con la planta física. La simulación descarta rápido las ternas que no sirven
          y deja pocas candidatas para probar en el equipo. En el camino apareció lo más importante: el problema no era la terna, era el retardo del derivativo.
        </SectionHead>

        <div className="reveal" style={{ border:'1px solid #1f1f1f', background:'#000', marginBottom:28 }}>
          <video src="assets/videos/entrenamiento_ternas.mp4" poster="assets/videos/entrenamiento_ternas.jpg" controls playsInline preload="metadata"
            style={{ width:'100%', display:'block', aspectRatio:'16/9', background:'#000' }}/>
        </div>

        <div className="reveal g4" style={{ marginBottom:40 }}>
          {pasos.map(([t, d], i) => (
            <div key={t} style={{ background:'#0b0b0b', border:'1px solid #1c1c1c', padding:'20px 20px 22px' }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:14, color:'var(--red)', marginBottom:8 }}>{i + 1}</div>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>{t}</div>
              <div style={{ fontSize:14, color:'#a9a6a0', lineHeight:1.6 }}>{d}</div>
            </div>
          ))}
        </div>

        <h3 className="reveal" style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>Pruébalo en vivo</h3>
        <p className="reveal" style={{ fontSize:15, color:'#a9a6a0', lineHeight:1.7, maxWidth:780, marginBottom:20 }}>
          La misma búsqueda corriendo en el navegador. Las generaciones 1 a 5 usan el VI original y se estancan; las 6 a 10 usan el VI corregido y convergen.
          Con la tecla V queda a pantalla completa.
        </p>
      </div>
      <Embebido src="entrenamiento.html" title="Búsqueda evolutiva de ternas PID con 20 gemelos" etiqueta="Iniciar el entrenamiento" nota="20 aeropéndulos · 10 generaciones"/>
    </section>
  );
};
Object.assign(window, { SimulatorSection, TrainingSection, Embebido });
