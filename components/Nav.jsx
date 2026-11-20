const { useState, useEffect } = React;

/* Logo de JARAPIS LAB (la J impresa en 3D) */
const BrandIcon = ({ size = 34 }) => (
  <img src="assets/marca/jarapis_j.png" alt="" aria-hidden="true" style={{ height:size, width:'auto', display:'block' }}/>
);

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);

  const links = [
    ['Problema', '#overview'],
    ['Instrumentación', '#specs'],
    ['Electrónica', '#electronica'],
    ['Modelo', '#model'],
    ['Gemelo digital', '#simulator'],
    ['Entrenamiento IA', '#entrenamiento'],
    ['Software', '#software'],
    ['Resultados', '#results'],
    ['Manual', '#docs'],
    ['Equipo', '#team'],
  ];

  return (
    <nav className={open ? 'mobile-menu-open' : ''} style={{
      position:'fixed', top:0, left:0, right:0, zIndex:200, height:60,
      display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px',
      background:(scrolled || open) ? 'rgba(13,13,13,0.97)' : 'transparent',
      borderBottom:(scrolled || open) ? '1px solid #1f1f1f' : '1px solid transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none', transition:'background 0.3s, border-color 0.3s',
    }}>
      <a href="#" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', zIndex:201 }}>
        <BrandIcon size={34}/>
        <div style={{ lineHeight:1.2 }}>
          <div style={{ fontFamily:"'Bebas Neue', var(--sans)", fontSize:20, letterSpacing:2.5, color:'var(--white)', lineHeight:1 }}>JARAPIS <span style={{ color:'var(--red)' }}>LAB</span></div>
          <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'var(--g2)', letterSpacing:1.5 }}>aeropéndulo invertido · 2026-2</div>
        </div>
      </a>

      <div className="nav-links" style={{ alignItems:'center', gap:22 }}>
        {links.map(([label, href]) => (
          <a key={label} href={href} onClick={() => setOpen(false)} style={{
            fontFamily:'var(--sans)', fontSize:11, fontWeight:500, letterSpacing:1.5, color:'var(--g1)', textDecoration:'none', transition:'color 0.2s',
          }}
            onMouseEnter={e => e.target.style.color='var(--white)'}
            onMouseLeave={e => e.target.style.color='var(--g1)'}
          >{label.toUpperCase()}</a>
        ))}
        <a href="simulador.html" style={{
          padding:'7px 16px', border:'1px solid var(--red)', color:'var(--red)', textDecoration:'none', fontSize:11, fontWeight:600,
          letterSpacing:1.5, fontFamily:'var(--sans)', transition:'all 0.2s', whiteSpace:'nowrap',
        }}
          onMouseEnter={e => { e.currentTarget.style.background='var(--red)'; e.currentTarget.style.color='#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--red)'; }}
        >ABRIR GEMELO</a>
      </div>

      <button className="hamburger" aria-label="Abrir menú" onClick={() => setOpen(!open)} style={{
        background:'none', border:'none', cursor:'pointer', padding:8, zIndex:201, flexDirection:'column', gap:5,
      }}>
        {[0,1,2].map(i => (
          <span key={i} style={{
            display:'block', width:22, height:2, background:'var(--white)', transition:'all 0.3s',
            transform: open ? (i===0 ? 'rotate(45deg) translate(5px,5px)' : i===2 ? 'rotate(-45deg) translate(5px,-5px)' : 'scaleX(0)') : 'none',
            opacity: open && i===1 ? 0 : 1,
          }}/>
        ))}
      </button>
    </nav>
  );
};

/* Encabezado reutilizable de sección */
// Encabezado de sección: número discreto, título normal y un párrafo legible
const SectionHead = ({ num, title, children }) => (
  <div className="reveal" style={{ marginBottom:40, maxWidth:880 }}>
    <h2 style={{ fontFamily:'var(--sans)', fontWeight:700, fontSize:'clamp(28px,3.6vw,44px)', letterSpacing:-0.8, lineHeight:1.15, marginBottom: children ? 16 : 0, display:'flex', gap:14, alignItems:'baseline', textWrap:'balance' }}>
      {num && <span style={{ fontFamily:'var(--mono)', fontSize:'0.45em', color:'var(--red)', fontWeight:500, letterSpacing:0 }}>{num}</span>}
      <span>{title}</span>
    </h2>
    {children && <p style={{ fontSize:'clamp(14.5px,1.4vw,16px)', lineHeight:1.75, color:'#aaa7a1', maxWidth:780 }}>{children}</p>}
  </div>
);

const Pending = ({ children }) => (
  <span style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:1.5, color:'#E5B000', border:'1px solid rgba(229,176,0,0.4)', padding:'3px 8px', display:'inline-block' }}>{children}</span>
);

/* Numeración oficial de piezas (igual a las figuras rotuladas) */
const PARTS = [
  ['1', 'Mástil'], ['2', 'Base con canal de cableado y tapas'], ['3', 'Varilla (250 mm)'], ['4', 'Acople varilla–encoder'],
  ['5', 'Encoder óptico YUMO E6B2-CWZ3E'], ['6', 'Soporte de motores'], ['7', 'Motor DC (×2)'], ['8', 'Hélice (×2)'],
  ['9', 'Caja electrónica'], ['10', 'DAQ NI USB-6212'], ['11', 'Generador de onda'],
];

Object.assign(window, { Nav, BrandIcon, SectionHead, Pending, PARTS });
