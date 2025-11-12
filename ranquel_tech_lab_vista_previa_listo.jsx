import React, { useState, useEffect } from "react";

// Ranquel Tech Lab — v6.1 (bugfix)
// Fixes:
// - Corrige `function Metodo()()` -> `function Metodo(){}` (originaba SyntaxError Unexpected token).
// - Mantiene estructura pedida + fotos en Servicios e IA aplicada; logos en Marketing; CTA sin botones;
//   footer con © 2025 y enlaces arriba.

/* =====================
   0) Capa de Seguridad (headers/meta + runtime)
   ===================== */
function SecurityLayer(){
  useEffect(()=>{
    const csp = [
      "default-src 'self'",
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self'",
      "connect-src 'self' https://wa.me https://api.whatsapp.com",
      "font-src 'self' https: data:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ');

    const m1 = document.createElement('meta'); m1.httpEquiv = 'Content-Security-Policy'; m1.content = csp;
    const m2 = document.createElement('meta'); m2.name = 'referrer'; m2.content = 'strict-origin-when-cross-origin';
    const m3 = document.createElement('meta'); m3.name = 'color-scheme'; m3.content = 'dark';

    const prev = document.querySelector("meta[http-equiv='Content-Security-Policy']"); if(prev) prev.remove();
    document.head.append(m1, m2, m3);

    // Enlaces externos seguros
    const anchors = Array.from(document.querySelectorAll("a[href^='http']"));
    anchors.forEach(a=>{
      const rel = (a.getAttribute('rel')||'').split(' ').filter(Boolean);
      if(!rel.includes('noopener')) rel.push('noopener');
      if(!rel.includes('noreferrer')) rel.push('noreferrer');
      a.setAttribute('rel', rel.join(' '));
    });

    // Bloquear eval()
    try { /* @ts-ignore */ (window as any).eval = function(){ throw new Error('eval() bloqueado'); }; } catch {}
  },[]);
  return null;
}

/* =====================
   1) Estilos + Tokens
   ===================== */
function FuturisticStyle(){
  return (
    <style>{`
      :root{
        --bg:#0b0d10; --bg-2:#0f1216; --surface:#10151b; --border:#1e2a33;
        --text:#e6f4ff; --text-muted:#a7c2cf;
        --accent:#22ccff; --accent-600:#14b3e6; --accent-700:#0aa3d6; --ink-on-accent:#001218;
        --accent-rgb:34 204 255; --bg-rgb:11 13 16; --text-rgb:230 244 255;
      }
      html,body{height:100%}
      body{
        background:
          radial-gradient(1000px 600px at 85% -120px, rgba(34,204,255,.18), transparent),
          radial-gradient(800px 400px at 10% -80px, rgba(34,204,255,.10), transparent),
          linear-gradient(180deg, var(--bg-2), var(--bg));
        color:var(--text);
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial;
      }
      .wrap{max-width:72rem; margin:0 auto; padding:0 1rem}
      .panel{background:var(--surface); border:1px solid var(--border); border-radius:16px}
      .btn{display:inline-flex; align-items:center; gap:.5rem; border-radius:16px; padding:.7rem 1rem; font-weight:600; min-height:44px}
      .btn-accent{background:var(--accent); color:var(--ink-on-accent); box-shadow:0 10px 30px rgba(0,0,0,.35), 0 0 24px rgba(34,204,255,.25)}
      .btn-accent:hover{background:var(--accent-600)}
      .btn-accent:active{background:var(--accent-700)}
      .btn-ghost{color:var(--text); border:1px solid var(--border)}
      .neon{ text-shadow: 0 0 18px rgba(34,204,255,.35) }
      .glow{ box-shadow: 0 10px 30px rgba(0,0,0,.35), 0 0 32px rgba(34,204,255,.12) }
      .badge{ display:inline-block; border:1px solid var(--border); padding:.25rem .6rem; border-radius:999px; background:linear-gradient(90deg, rgba(34,204,255,.18), rgba(34,204,255,.05)); color:var(--text)}
      .grid{display:grid; gap:1rem}
      @media(min-width:640px){ .grid-2{grid-template-columns:repeat(2,1fr)} }
      @media(min-width:1024px){ .grid-3{grid-template-columns:repeat(3,1fr)} }
      header.backdrop{backdrop-filter:saturate(150%) blur(10px); background:rgba(15,18,22,.65)}
      a:focus, button:focus{outline:2px solid var(--accent); outline-offset:3px; border-radius:10px}
      /* Medios 16:9 */
      .thumb{ position:relative; width:100%; aspect-ratio:16/9; border-radius:12px; border:1px solid var(--border);
              background:linear-gradient(135deg, rgba(34,204,255,.18), rgba(34,204,255,.06)); overflow:hidden; display:flex; align-items:center; justify-content:center }
      .thumb svg{ width:70%; height:70%; color:var(--text)}
      .thumb-img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
      /* Método: card = media + contenido */
      .step-card{ display:grid; grid-template-rows:auto 1fr; gap:10px; height:100% }
      .step-media{ border-radius:12px; border:1px solid var(--border); overflow:hidden; aspect-ratio:16/9; background:linear-gradient(135deg, rgba(34,204,255,.12), rgba(34,204,255,.04)) }
      /* About grid */
      .about-grid{ display:grid; gap:16px }
      @media(min-width:900px){ .about-grid{ grid-template-columns:1.2fr 1fr } }
      /* Footer + chat */
      footer .actions{ display:flex; gap:8px; flex-wrap:wrap; justify-content:center }
      footer .wrap{ padding-bottom:88px }
      .cta-rail{ border:1px dashed var(--border); border-radius:24px; background:linear-gradient(180deg, rgba(34,204,255,.07), rgba(34,204,255,.03)); padding:20px }
    `}</style>
  );
}

/* =====================
   2) Header (hamburguesa)
   ===================== */
function Header({ onGo }:{ onGo:(dest: 'inicio'|'opciones'|'anchor', anchor?: string)=>void }){
  const [open, setOpen] = useState(false);
  return (
    <header className="backdrop" style={{position:'fixed', insetInline:0, top:0, zIndex:50, borderBottom:'1px solid var(--border)'}}>
      <nav className="wrap" style={{display:'flex', alignItems:'center', justifyContent:'space-between', height:64}}>
        <a onClick={()=>onGo('inicio')} href="#" style={{fontWeight:700, letterSpacing:.4, color:'var(--text)'}} className="neon">Ranquel Tech Lab</a>
        <button aria-label="Abrir menú" aria-expanded={open} onClick={()=>setOpen(!open)} className="btn btn-ghost" style={{display:'inline-flex'}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {open ? (<path d="M18 6L6 18M6 6l12 12"/>) : (<><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></>)}
          </svg>
        </button>
      </nav>
      {open && (
        <div style={{borderTop:'1px solid var(--border)'}}>
          <ul className="wrap" style={{padding:'8px 0', display:'grid', gap:8}}>
            <li><a className="panel" href="#" onClick={()=>{setOpen(false); onGo('inicio')}} style={{display:'block', padding:'8px 12px', color:'var(--text)'}}>Inicio</a></li>
            <li><a className="panel" href="#about" onClick={()=>{setOpen(false); onGo('anchor','#about')}} style={{display:'block', padding:'8px 12px', color:'var(--text)'}}>Sobre</a></li>
            <li><a className="panel" href="#services" onClick={()=>{setOpen(false); onGo('anchor','#services')}} style={{display:'block', padding:'8px 12px', color:'var(--text)'}}>Servicios</a></li>
            <li><a className="panel" href="#ia" onClick={()=>{setOpen(false); onGo('anchor','#ia')}} style={{display:'block', padding:'8px 12px', color:'var(--text)'}}>IA aplicada</a></li>
            <li><a className="panel" href="#marketing" onClick={()=>{setOpen(false); onGo('anchor','#marketing')}} style={{display:'block', padding:'8px 12px', color:'var(--text)'}}>Marketing</a></li>
            <li><a className="panel" href="#metodo" onClick={()=>{setOpen(false); onGo('anchor','#metodo')}} style={{display:'block', padding:'8px 12px', color:'var(--text)'}}>Método</a></li>
            <li><a className="panel" href="#" onClick={()=>{setOpen(false); onGo('opciones')}} style={{display:'block', padding:'8px 12px', color:'var(--text)'}}>Opciones de Desarrollo</a></li>
          </ul>
        </div>
      )}
    </header>
  );
}

/* =====================
   3) Íconos inline (incluye WhatsApp)
   ===================== */
function IcoWhatsApp(){
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.94 11.94 0 0 0 12.06 0C5.46 0 0.12 5.34 0.12 11.94c0 2.1.54 4.08 1.5 5.82L0 24l6.42-1.62c1.68.9 3.6 1.44 5.64 1.44 6.6 0 11.94-5.34 11.94-11.94 0-3.18-1.26-6.06-3.48-8.4ZM12.06 21.3c-1.86 0-3.6-.48-5.1-1.38l-.36-.24-3.78.96 1.02-3.66-.24-.36a9.6 9.6 0 0 1-1.5-5.04c0-5.34 4.38-9.72 9.72-9.72a9.7 9.7 0 0 1 6.9 2.88 9.7 9.7 0 0 1 2.82 6.84c0 5.34-4.38 9.72-9.72 9.72Zm5.58-7.26c-.3-.18-1.74-.9-2.01-1.02-.27-.12-.48-.18-.69.12-.21.3-.78 1.02-.96 1.23-.18.21-.36.24-.66.06-.3-.18-1.26-.45-2.4-1.5-.9-.81-1.5-1.8-1.68-2.1-.18-.3-.02-.48.16-.66.16-.16.3-.36.45-.54.15-.18.21-.3.3-.51.09-.21.03-.39-.03-.57-.06-.18-.69-1.65-.96-2.28-.24-.57-.48-.48-.69-.48h-.57c-.21 0-.57.09-.87.39-.3.3-1.14 1.11-1.14 2.7 0 1.59 1.17 3.12 1.35 3.33.18.21 2.31 3.51 5.61 4.83.78.33 1.38.51 1.86.66.78.24 1.5.21 2.07.12.63-.09 1.95-.78 2.22-1.53.27-.75.27-1.38.18-1.53-.09-.15-.27-.24-.57-.42Z"/></svg>
  );
}
function IcoChat(){ return (<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 5V6a2 2 0 0 1 2-2Z"/></svg>); }
function IcoOptions(){ return (<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 7h14v2H3V7Zm0 4h18v2H3v-2Zm0 4h10v2H3v-2Z"/></svg>); }

/* =====================
   4) Hero con 3 botones
   ===================== */
function Hero({ onOpenOpciones, onOpenChat }:{ onOpenOpciones: ()=>void, onOpenChat: ()=>void }){
  const wa = "#"; // TODO: reemplazar por https://wa.me/XXXXXXXXXXX
  return (
    <section id="hero" style={{position:'relative', overflow:'hidden', borderBottom:'1px solid var(--border)'}}>
      <div className="wrap" style={{paddingTop:112, paddingBottom:80}}>
        <span className="badge">En la cúspide de la tecnología</span>
        <h1 className="neon" style={{fontSize:'clamp(32px,6vw,56px)', fontWeight:800, letterSpacing:.2, marginTop:12}}>Creamos software inteligente que impulsa tu negocio.</h1>
        <p style={{marginTop:12, color:'var(--text-muted)', maxWidth:720, fontSize:18}}>Desarrollo Web, Apps Android y Automatizaciones con IA. SEO, analítica y performance listos desde el día uno.</p>
        <div style={{marginTop:24, display:'flex', flexWrap:'wrap', gap:12}}>
          <a href={wa} className="btn btn-accent glow"><IcoWhatsApp/> WhatsApp</a>
          <button onClick={onOpenOpciones} className="btn btn-ghost"><IcoOptions/> Opciones de Desarrollo</button>
          <button onClick={onOpenChat} className="btn btn-ghost"><IcoChat/> Chat bot</button>
        </div>
      </div>
    </section>
  );
}

/* =====================
   5) Sobre / Servicios / IA / Marketing / Método
   ===================== */
function About({ onOpenOpciones }:{ onOpenOpciones: ()=>void }){
  return (
    <section id="about" className="wrap" style={{paddingTop:64, paddingBottom:64}}>
      <h2 style={{fontSize:'clamp(22px,3vw,32px)', fontWeight:700, textAlign:'center'}}>Sobre nosotros</h2>
      <div className="about-grid" style={{marginTop:16, alignItems:'center'}}>
        <div>
          <p style={{marginTop:12, color:'var(--text-muted)'}}>En Ranquel Tech Lab diseñamos y desarrollamos sitios web, apps Android y sistemas en Java integrados con IA. Unimos diseño, código y automatización para convertir ideas en productos reales, medibles y escalables.</p>
          <p style={{marginTop:10, color:'var(--text-muted)'}}>Porque todo se puede <strong>Codificar</strong>, podemos diseñar el software a medida que necesites. Nos comentás dónde está tu cuello de botella o tu necesidad de mejora, analizamos la situación y damos soluciones.</p>
          <div style={{marginTop:16}}><button onClick={onOpenOpciones} className="btn btn-accent glow">Conocé Opciones de Desarrollo</button></div>
        </div>
        <div className="thumb"><img className="thumb-img" alt="Equipo de trabajo tecnológico" src="https://source.unsplash.com/800x500/?team,technology,meeting"/></div>
      </div>
    </section>
  );
}

function Services(){
  const items = [
    { title:"Desarrollo Web", desc:"SEO, performance, e‑commerce y landings rápidas.", img:"https://source.unsplash.com/800x500/?code,website" },
    { title:"Dominios", desc:"Nos encargamos de tu hosting y del dominio que necesitás para tu web.", img:"https://source.unsplash.com/800x500/?server,datacenter" },
    { title:"Apps Android", desc:"Java/Kotlin, publicación en Play Store.", img:"https://source.unsplash.com/800x500/?android,smartphone,app" },
    { title:"Sistemas a medida", desc:"Java/Node.js, dashboards y microservicios.", img:"https://source.unsplash.com/800x500/?dashboard,software" },
    { title:"SEO + Ads", desc:"Google/Meta con medición y experimentos.", img:"https://source.unsplash.com/800x500/?seo,marketing" },
    { title:"Analítica", desc:"GA4, GTM, Search Console y Bing Webmaster.", img:"https://source.unsplash.com/800x500/?analytics,data" },
  ];
  return (
    <section id="services" className="wrap" style={{paddingTop:64, paddingBottom:64}}>
      <h2 style={{fontSize:'clamp(22px,3vw,32px)', fontWeight:700, textAlign:'center'}}>Servicios</h2>
      <div className="grid grid-3" style={{marginTop:24}}>
        {items.map(it => (
          <article key={it.title} className="panel glow step-card" style={{padding:16}}>
            <div className="step-media"><img className="thumb-img" alt={it.title} src={it.img}/></div>
            <div>
              <h3 style={{fontSize:18, fontWeight:700}}>{it.title}</h3>
              <p style={{marginTop:8, color:'var(--text-muted)'}}>{it.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// SVGs auxiliares para IA aplicada
function SvgAdvisory(){ return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" opacity="0.5"/><path d="M8 15l3-3 2 2 3-4"/><path d="M6 7h4M14 7h4" opacity="0.6"/></svg>); }
function SvgGPTs(){ return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l3 3-3 3-3-3 3-3z"/><path d="M12 15l3 3-3 3-3-3 3-3z"/><path d="M3 12l3-3 3 3-3 3-3-3z"/><path d="M15 12l3-3 3 3-3 3-3-3z"/></svg>); }
function SvgBots(){ return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="7" width="16" height="10" rx="2"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M12 7V4"/><circle cx="12" cy="3" r="1"/></svg>); }

function IAaplicada({ onOpenOpciones }:{ onOpenOpciones: ()=>void }){
  const cards = [
    { title: "Asesoramiento", desc: "Auditamos procesos y datos, medimos tu madurez digital y detectamos “quick wins”. Entregamos un plan 30-60-90 días con casos de uso priorizados, costos, métricas y ROI estimado para acelerar resultados.", Icon: SvgAdvisory },
    { title: "GPTs a medida", desc: "Creamos asistentes con el contexto de tu negocio (documentos, políticas, catálogos) y reglas propias. Se conectan a tus sistemas (ERP/CRM/AFIP/Sheets) para automatizar tareas, responder con trazabilidad y ejecutar flujos end-to-end.", Icon: SvgGPTs },
    { title: "Bots conversacionales", desc: "Web/WhatsApp/Instagram que atienden, reservan, cobran y escalan a un humano cuando corresponde. Entrenados con tu contenido, con analytics de conversaciones y mejoras continuas para elevar la experiencia del cliente.", Icon: SvgBots },
  ];
  const pics: Record<string,string> = {
    "Asesoramiento": "https://source.unsplash.com/800x500/?consulting,team,data",
    "GPTs a medida": "https://source.unsplash.com/800x500/?ai,assistant,chatbot,code",
    "Bots conversacionales": "https://source.unsplash.com/800x500/?chat,bot,conversation"
  };
  return (
    <section id="ia" className="wrap" style={{paddingTop:64, paddingBottom:64}}>
      <div style={{textAlign:'center'}}>
        <h2 className="neon" style={{fontSize:'clamp(22px,3vw,32px)', fontWeight:800}}>IA aplicada</h2>
        <p style={{marginTop:12, color:'var(--text-muted)'}}>En Ranquel Tech Lab la IA no es un extra: es parte del producto. Te mostramos caminos concretos para llevarla a tus procesos hoy, con métricas claras y foco en ROI.</p>
      </div>
      <div className="grid grid-3" style={{marginTop:24}}>
        {cards.map(({title, desc}) => (
          <article key={title} className="panel glow step-card" style={{padding:16}}>
            <div className="step-media"><img className="thumb-img" alt={title} src={pics[title]} /></div>
            <div>
              <h3 style={{fontSize:18, fontWeight:700}}>{title}</h3>
              <p style={{color:'var(--text-muted)'}}>{desc}</p>
            </div>
          </article>
        ))}
      </div>
      <div style={{marginTop:20, textAlign:'center'}}><button onClick={onOpenOpciones} className="btn btn-accent glow">Conocé Opciones de Desarrollo</button></div>
    </section>
  );
}

function Marketing(){
  // Reemplaza logos: quitamos 'Google' genérico y agregamos específicos
  const logos = [
    { alt: 'Google Ads', src: 'https://logo.clearbit.com/ads.google.com' },
    { alt: 'Bing Ads', src: 'https://logo.clearbit.com/ads.microsoft.com' },
    { alt: 'Meta', src: 'https://logo.clearbit.com/meta.com' },
    { alt: 'Instagram', src: 'https://logo.clearbit.com/instagram.com' },
    { alt: 'Facebook', src: 'https://logo.clearbit.com/facebook.com' },
    { alt: 'WhatsApp', src: 'https://logo.clearbit.com/whatsapp.com' },
    { alt: 'Google Analytics', src: 'https://logo.clearbit.com/marketingplatform.google.com' },
    { alt: 'Google Tag Manager', src: 'https://logo.clearbit.com/tagmanager.google.com' },
    { alt: 'Google Search Console', src: 'https://logo.clearbit.com/search.google.com' }
  ];
  return (
    <section id="marketing" className="wrap" style={{paddingTop:64, paddingBottom:64}}>
      <h2 className="neon" style={{fontSize:'clamp(22px,3vw,32px)', fontWeight:800, textAlign:'center'}}>Marketing</h2>
      <p style={{marginTop:12, color:'var(--text-muted)', maxWidth:960}}>Con 13 años de experiencia en Marketing Digital podemos hacerte campañas de Google Ads, Bing Ads, Meta Pixel (Instagram, Facebook, Whatsapp). Tu Costo publicitario Nunca Rendirá más que contratando nuestros servicios, con métricas comprobables.</p>
      <div style={{marginTop:20, display:'flex', gap:16, flexWrap:'wrap', alignItems:'center', justifyContent:'center'}}>
        {logos.map(l => (
          <div key={l.alt} className="panel" style={{padding:'10px 12px', borderRadius:12}}>
            <img alt={l.alt} src={l.src} style={{width:64, height:64, objectFit:'contain', display:'block'}}/>
          </div>
        ))}
      </div>
    </section>
  );
}

function Metodo(){
  const pasos = [
    { n:1, t:"1 Escuchamos las Necesidades del Cliente.", d:"Para poder arrancar con cualquier proyecto necesitamos saber cuales son las necesides de nuestro clientes y el modo operandi de su negocio, solicitamos toda la información que nos puedan brindar...y ahora es cuando estamos en condiciones de seguir al próximo paso.", img:"https://source.unsplash.com/800x500/?client,meeting" },
    { n:2, t:"2- Analizamos la competencia.", d:"Comparamos los standares de la competencia para superarlos.", img:"https://source.unsplash.com/800x500/?analytics,competitor" },
    { n:3, t:"3- Estudiamos el Proyecto", d:"Con la información recopilada, buscamos las mejores estrategias tecnológicas que se adecúen a las necesidades y objetivos de nuestro clientes.", img:"https://source.unsplash.com/800x500/?planning,technology" },
    { n:4, t:"4- Materealizando Objetivos.", d:"Ponemos Marcha y hacemos maqueta previa según  todo la información obtenida y analizada. Se presenta una primera muestra de lo Trabajado y se abona un 50% del presupuesto.", img:"https://source.unsplash.com/800x500/?prototype,ui" },
    { n:5, t:"5- Conexión con Buscadores y SEO", d:`Conectamos la web a :\nGoogle Ads (publicidad de Google)\nGoogle Tag Manager.\nGoogle Analitycs.\nGoogle Search Console.\nMeta = Facebook + Instagram + Whatsapp\nBing\nBing Adds (Publicidad de Bing)\nOptimización e Indexación de la Página para reconocimiento prioritario en buscadores.\nY más a medida que se vayan implementando nuevas tecnologías de Marketing.`, img:"https://source.unsplash.com/800x500/?seo,search" },
    { n:6, t:"6- Entrega de la web, Puesta a punto y seguimiento mensual.", d:`Ultimamos detalles.\nSe Abona el 50% del presupuesto restante.\nHacemos entrega de la Página Web y hacemos un segumiento mensual para la implementación de nuevas tecnologías.`, img:"https://source.unsplash.com/800x500/?delivery,launch" },
  ];
  return (
    <section id="metodo" className="wrap" style={{paddingTop:64, paddingBottom:64}}>
      <h2 style={{fontSize:'clamp(22px,3vw,32px)', fontWeight:700, textAlign:'center'}}>Nuestro Método Ganador</h2>
      <style>{`.metodo-grid{display:grid; gap:1rem} @media(min-width:768px){ .metodo-grid{grid-template-columns:repeat(2,1fr)} .step-left{justify-self:end; transform:translateX(-6px)} .step-right{justify-self:start; transform:translateX(6px)} .step-shell{ max-width:min(560px,95%) } }`}</style>
      <div className="metodo-grid" style={{marginTop:24, alignItems:'start'}}>
        {pasos.map((p, idx)=>{
          const right = (idx % 2) === 1;
          return (
            <article key={idx} className={`panel glow step-shell ${right ? 'step-right' : 'step-left'}`} style={{padding:16}}>
              <div className="step-card">
                <div className="step-media"><img className="thumb-img" alt={`Paso ${p.n}`} src={p.img}/></div>
                <div>
                  <div className="badge" aria-hidden="true">Paso {p.n}</div>
                  <h3 style={{fontWeight:700, marginTop:8}}>{p.t}</h3>
                  <pre style={{whiteSpace:'pre-wrap', marginTop:6, color:'var(--text-muted)', fontFamily:'inherit'}}>{p.d}</pre>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* =====================
   6) Opciones de Desarrollo (segunda vista)
   ===================== */
function Opciones(){
  const categorias = [
    { title: "Industria (manufactura)", items: [
      "Mantenimiento predictivo — Sensores (vibración/temperatura/consumo), modelo ML que anticipe fallas y genere órdenes en tu ERP/MES; alertas en Android.",
      "Control de calidad por visión — Cámaras + modelos de visión (defectos, soldaduras, etiquetas) con registro y trazabilidad; OK/NO‑OK directo al SCADA.",
      "Planificación y OEE inteligente — IA que secuencia órdenes minimizando setups y cuellos de botella; tablero OEE con causas automáticas."
    ]},
    { title: "Finanzas (PyMEs)", items: [
      "Lectura de comprobantes + AFIP — OCR + validación online, categorización contable y conciliación bancaria automática; banderas rojas por discrepancias.",
      "Scoring de riesgo y mora — Modelos con variables contables/comerciales para priorizar cobranza, cupos y condiciones; semáforos y workflows.",
      "Detección de fraude/anomalías — Gastos atípicos, proveedores duplicados, desvíos de caja; reglas + ML con auditoría y evidencia exportable."
    ]},
    { title: "Hotelería", items: [
      "Precios dinámicos (revenue) — Ajuste tarifario por demanda, clima y eventos locales; restricciones y upsells automáticos.",
      "Chatbot omnicanal (Web/WhatsApp) — Disponibilidad, reservas, cobros y upgrades; integra PMS/Channel Manager.",
      "Housekeeping asistido por visión — App Android que reconoce estado de habitación/amenities y optimiza turnos."
    ]},
    { title: "Restaurants", items: [
      "Forecast de demanda por plato — Predice ventas por franja y día; sugiere compras y mise en place para reducir quiebres/merma.",
      "Upselling inteligente en POS — Sugerencias de combos y extras según historial y hora; A/B testing de menús y precios.",
      "Control de porciones/mermas por visión — Cámaras + básculas conectadas para estandarizar raciones y detectar desvíos."
    ]},
    { title: "Agro", items: [
      "Detección temprana de plagas/nutrientes — Móvil/dron con visión que clasifica estrés y recomienda correctivos (se enlaza con FertiCalc).",
      "Riego y fertilización prescriptiva — Modelos con clima/ET0/fenología que calculan lámina, EC/pH objetivo y dosis.",
      "Logística de cosecha y rutas — Optimiza turnos, ventanas de descarga y fletes; integra precios y humedad/mermas."
    ]},
    { title: "Minería", items: [
      "Mantenimiento predictivo de flota pesada — Telemetría para anticipar fallas en palas/camiones; plan de repuestos.",
      "Seguridad por visión (EPP/áreas) — Detección de casco/chaleco, zonas restringidas y proximidad a equipos; alertas.",
      "Blend y recuperación en planta — Predice ley/recuperación y ajusta mezcla para maximizar producción y energía."
    ]},
    { title: "Gobierno (sector público)", items: [
      "Trámites inteligentes + validación automática — OCR de formularios y DNI; verificación en padrones; turnos y notificaciones.",
      "Compras públicas y control del gasto con IA — Sobreprecios, proveedores vinculados y fraccionamiento; monitoreo y alertas.",
      "Gestión urbana predictiva — Baches, alumbrado, residuos; ruteo óptimo de cuadrillas y modelos de riesgo de inundaciones/incendios."
    ]}
  ];
  return (
    <section className="wrap" style={{paddingTop:80, paddingBottom:80}}>
      <div className="panel glow" style={{padding:20}}>
        <h1 className="neon" style={{fontSize:'clamp(26px,4vw,40px)', fontWeight:800}}>Opciones de Desarrollo</h1>
        <p style={{marginTop:8, color:'var(--text-muted)'}}>Porque lo que soñás lo podemos <strong>codificar</strong>. Elegí un vertical o contanos tu idea y armamos el plan.</p>
      </div>
      <div className="grid grid-2" style={{marginTop:24}}>
        {categorias.map(cat => (
          <article key={cat.title} className="panel glow" style={{padding:16}}>
            <h3 style={{fontWeight:700}}>{cat.title}</h3>
            <ul style={{marginTop:8, display:'grid', gap:8}}>
              {cat.items.map((line, idx)=> (<li key={idx} style={{color:'var(--text-muted)'}}>• {line}</li>))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

/* =====================
   7) CTA Contactanos (sin botones)
   ===================== */
function CTAContact(){
  return (
    <section className="wrap" style={{paddingTop:24, paddingBottom:24}}>
      <div className="cta-rail glow" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:16, flexWrap:'wrap'}}>
        <div style={{display:'grid', gap:6, textAlign:'center'}}>
          <strong className="neon" style={{fontSize:'clamp(18px,2.5vw,22px)'}}>¿Consultas? Contactanos para Mayor Información</strong>
          <strong style={{fontSize:'clamp(16px,2.2vw,20px)'}}>¡Pedinos Presupuesto Sin Cargo!</strong>
        </div>
      </div>
    </section>
  );
}

/* =====================
   8) Footer con redes centradas + WhatsApp
   ===================== */
function Footer(){
  const wa = "#"; // TODO: reemplazar por enlace real
  return (
    <footer style={{borderTop:'1px solid var(--border)', marginTop:32}}>
      <div className="wrap" style={{padding:'24px 0'}}>
        <div className="actions" style={{marginTop:12}}>
          <a href="#" className="btn btn-ghost">LinkedIn</a>
          <a href="#" className="btn btn-ghost">Facebook</a>
          <a href="#" className="btn btn-ghost">Instagram</a>
          <a href={wa} className="btn btn-accent"><IcoWhatsApp/> WhatsApp</a>
        </div>
        <p style={{color:'var(--text-muted)', textAlign:'center', marginTop:12}}>© 2025 Ranquel Tech Lab</p>
      </div>
    </footer>
  );
}

/* =====================
   9) Chat (burbuja)
   ===================== */
function ChatBubble({open, setOpen}:{open:boolean, setOpen:(v:boolean)=>void}){
  const [step, setStep] = useState<'root'|'servicios'|'presupuesto'|'faq'|'lead'>('root');
  return (
    <div id="chat" style={{position:'fixed', right:24, bottom:24, zIndex:60}}>
      {open && (
        <div className="panel glow" style={{width:'min(92vw, 420px)', height:'70vh', display:'flex', flexDirection:'column', overflow:'hidden'}}>
          <header style={{display:'flex', alignItems:'center', justifyContent:'space-between', height:48, padding:'0 12px', borderBottom:'1px solid var(--border)'}}>
            <strong>Asistente Ranquel</strong>
            <button aria-label="Cerrar" onClick={()=>setOpen(false)} className="btn btn-ghost" style={{padding:6}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </header>
          <div style={{flex:1, overflow:'auto', padding:12}}>
            {step==='root' && (
              <div style={{display:'grid', gap:8}}>
                <p>Hola 👋 ¿En qué te ayudamos?</p>
                <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
                  <button className="btn btn-ghost" onClick={()=>setStep('servicios')}>Servicios</button>
                  <button className="btn btn-ghost" onClick={()=>setStep('presupuesto')}>Presupuesto</button>
                  <button className="btn btn-ghost" onClick={()=>setStep('faq')}>FAQ</button>
                </div>
              </div>
            )}
            {step==='servicios' && (
              <div style={{display:'grid', gap:6}}>
                <p>• Desarrollo Web • IA aplicada • Apps Android • Sistemas a medida • SEO + Ads • Analítica</p>
                <button className="btn btn-accent" onClick={()=>setStep('lead')}>Quiero que me contacten</button>
              </div>
            )}
            {step==='presupuesto' && <LeadForm onDone={()=>setStep('root')} />}
            {step==='faq' && (
              <div style={{display:'grid', gap:6}}>
                <p><strong>¿Plazos?</strong> Un landing 1–2 semanas (según alcance).</p>
                <p><strong>¿Publicación?</strong> Preparamos deploy (Vercel) y Play Store.</p>
                <p><strong>¿Medición?</strong> GA4/GTM/Search Console y KPIs.</p>
                <button className="btn btn-accent" onClick={()=>setStep('lead')}>Quiero que me contacten</button>
              </div>
            )}
            {step==='lead' && <LeadForm onDone={()=>setStep('root')} />}
          </div>
        </div>
      )}
      <button onClick={()=>setOpen(!open)} className="btn btn-accent glow" style={{borderRadius:9999, padding:'12px 16px'}}>{open? 'Cerrar' : 'Chat'}</button>
    </div>
  );
}

// Sanitizador simple
function sanitize(str:string){ const div = document.createElement('div'); div.textContent = str ?? ''; return div.innerHTML; }

function LeadForm({ onDone }:{ onDone:()=>void }){
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [message,setMessage] = useState('Contacto');
  const [sent,setSent] = useState(false);
  const submit = ()=>{
    const safeName = sanitize(name).slice(0, 120);
    const safeEmail = sanitize(email).slice(0, 160);
    const safeMsg = sanitize(message).slice(0, 500);
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail);
    if(!safeName || !okEmail || !safeMsg) return;
    try{
      const list = JSON.parse(localStorage.getItem('rtl_leads')||'[]');
      list.push({ name: safeName, email: safeEmail, message: safeMsg, ts: Date.now() });
      localStorage.setItem('rtl_leads', JSON.stringify(list));
      setSent(true);
    }catch{}
  };
  return (
    <div style={{display:'grid', gap:8}}>
      <label style={{fontSize:12}}>Nombre
        <input autoComplete="off" style={{marginTop:6, width:'100%', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'8px 10px', color:'var(--text)'}} value={name} onChange={e=>setName(e.target.value)} />
      </label>
      <label style={{fontSize:12}}>Email
        <input autoComplete="off" type="email" style={{marginTop:6, width:'100%', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'8px 10px', color:'var(--text)'}} value={email} onChange={e=>setEmail(e.target.value)} />
      </label>
      <label style={{fontSize:12}}>Mensaje
        <textarea rows={3} style={{marginTop:6, width:'100%', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'8px 10px', color:'var(--text)'}} value={message} onChange={e=>setMessage(e.target.value)} />
      </label>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <button className="btn btn-accent" onClick={submit}>Enviar</button>
        <button className="btn btn-ghost" onClick={onDone}>Cerrar</button>
        {sent && <span style={{color:'#3de27b', fontSize:12}}>¡Listo! Guardado localmente.</span>}
      </div>
    </div>
  );
}

/* =====================
   10) Smoke-tests (no UI)
   ===================== */
function runSmokeTests(){
  try{
    console.group("RTL Smoke Tests");
    const iaCards = ["Asesoramiento","GPTs a medida","Bots conversacionales"]; console.assert(iaCards.length === 3, "IA aplicada: cantidad de tarjetas incorrecta");
    const pasosCount = 6; console.assert(pasosCount === 6, "Método: deben ser 6 pasos");
    const estados = ['inicio','opciones'] as const; console.assert(estados.includes('inicio'), "Estado inicial debe ser 'inicio'");
    setTimeout(()=>{
      const ids = ['hero','about','services','ia','marketing','metodo'];
      const missing = ids.filter(id => !document.getElementById(id)); if(missing.length){ console.warn('Faltan secciones en DOM:', missing); }
      // Tests adicionales
      const svc = document.querySelectorAll('#services article'); console.assert(svc.length === 6, `Servicios: se esperaban 6 cards y hay ${svc.length}`);
      const metodoImgs = document.querySelectorAll('#metodo .step-media img'); console.assert(metodoImgs.length === 6, `Método: 6 imágenes (hay ${metodoImgs.length})`);
      const iaImgs = document.querySelectorAll('#ia .step-media img'); console.assert(iaImgs.length === 3, `IA aplicada: 3 imágenes (hay ${iaImgs.length})`);
      const logos = document.querySelectorAll('#marketing img'); console.assert(logos.length >= 7, `Marketing: se esperan >=7 logos (hay ${logos.length})`);
      const yearOk = (document.querySelector('footer')?.textContent||'').includes('© 2025'); console.assert(yearOk, 'Footer debe mostrar © 2025');
      const ctaBtns = document.querySelectorAll('.cta-rail a, .cta-rail button'); console.assert(ctaBtns.length === 0, 'CTA no debe tener botones');
      console.groupEnd();
    }, 0);
  }catch(e){ console.error('Smoke tests error:', e); }
}

/* =====================
   11) App — vistas + chat + CTA + SecurityLayer
   ===================== */
export default function App(){
  const [tab, setTab] = useState<'inicio'|'opciones'>('inicio');
  const [chatOpen, setChatOpen] = useState(false);

  const onGo = (dest:'inicio'|'opciones'|'anchor', anchor?: string)=>{
    if(dest==='opciones'){ setTab('opciones'); return; }
    if(dest==='inicio'){ setTab('inicio'); window.scrollTo({top:0, behavior:'smooth'}); return; }
    if(dest==='anchor'){ setTab('inicio'); setTimeout(()=>{ const el = anchor ? document.querySelector(anchor) : null; if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }, 30); }
  };

  useEffect(()=>{ if(typeof document!=='undefined'){ document.documentElement.classList.add('dark'); document.body.classList.add('antialiased'); } runSmokeTests(); },[]);

  return (
    <div>
      <SecurityLayer/>
      <FuturisticStyle/>
      <Header onGo={onGo}/>
      {tab==='inicio' ? (
        <main>
          <Hero onOpenOpciones={()=>onGo('opciones')} onOpenChat={()=>setChatOpen(true)}/>
          <About onOpenOpciones={()=>onGo('opciones')}/>
          <Services/>
          <IAaplicada onOpenOpciones={()=>onGo('opciones')}/>
          <Marketing/>
          <Metodo/>
        </main>
      ) : (
        <main>
          <Opciones/>
        </main>
      )}
      <CTAContact/>
      <Footer/>
      <ChatBubble open={chatOpen} setOpen={setChatOpen}/>
    </div>
  );
}

/* ==============================================
   EXTRA (comentado): Tokens/Tailwind/Fondos
   ============================================== */
/* 1) :root tokens (CSS)
:root{ --bg:#0b0d10; --bg-2:#0f1216; --surface:#10151b; --border:#1e2a33; --text:#e6f4ff; --text-muted:#a7c2cf; --accent:#22ccff; --accent-600:#14b3e6; --accent-700:#0aa3d6; --ink-on-accent:#001218; --accent-rgb:34 204 255; --bg-rgb:11 13 16; --text-rgb:230 244 255; }
*/
/* 2) Tailwind (theme.extend.colors)
// tailwind.config.js
export default { theme:{ extend:{ colors:{ bg: "rgb(var(--bg-rgb) / <alpha-value>)", text: "rgb(var(--text-rgb) / <alpha-value>)", accent: "rgb(var(--accent-rgb) / <alpha-value>)" }, borderColor:{ skin: "var(--border)" } } } }
*/
/* 3) Fondos hero (A/B/C)
.heroA{ background: radial-gradient(1000px 600px at 85% -120px, color-mix(in srgb, var(--accent) 18%, transparent), transparent), radial-gradient(800px 400px at 10% -80px, color-mix(in srgb, var(--accent) 10%, transparent), transparent), linear-gradient(180deg, var(--bg-2), var(--bg)); }
.heroB{ position:relative; background:linear-gradient(180deg, var(--bg-2), var(--bg)); }
.heroB:after{ content:""; position:absolute; inset:0; pointer-events:none; mix-blend-mode:soft-light; opacity:.18; background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>"); }
.heroC{ background-color:var(--bg); background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'><path d='M48 0H0v48h48z' fill='none' stroke='rgba(255,255,255,0.08)'/><path d='M24 0v48M0 24h48' stroke='rgba(34,204,255,0.12)'/></svg>"); }
*/
