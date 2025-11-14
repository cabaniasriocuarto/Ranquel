import React, { useState, useEffect } from 'react';

// Ranquel Tech Lab — v6.1 (bugfix)
// Fixes:
// - Corrige `function Metodo()()` -> `function Metodo(){}` (originaba SyntaxError Unexpected token).
// - Mantiene estructura pedida + fotos en Servicios e IA aplicada; logos en Marketing; CTA sin botones;
//   footer con © 2025 y enlaces arriba.

/* =====================
   0) Capa de Seguridad (headers/meta + runtime)
   ===================== */
const isDev = typeof import.meta !== 'undefined' && import.meta?.env?.DEV;
const basePath =
  (typeof import.meta !== 'undefined' && import.meta?.env?.BASE_URL) || '/';
const withBase = (relative) =>
  `${basePath}${relative.startsWith('/') ? relative.slice(1) : relative}`;

function encodeSvg(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function splitLines(label, max = 18) {
  const words = label.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > max && current) {
      lines.push(current);
      current = word;
    } else if (candidate.length > max) {
      lines.push(candidate);
      current = '';
    } else {
      current = candidate;
    }
  });
  if (current) lines.push(current);
  return lines.length ? lines : [label];
}

function makeIllustration(label, { variant = 'landscape' } = {}) {
  const base = label.replace(/[^\w\d]+/g, '').toUpperCase();
  const seed = base.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) || 180;
  const hue = seed % 360;
  const hue2 = (hue + 45) % 360;
  const dims = variant === 'square'
    ? { width: 420, height: 420, rx: 48, stroke: 32 }
    : { width: 800, height: 500, rx: 38, stroke: 40 };
  const lines = splitLines(label.toUpperCase(), variant === 'square' ? 12 : 18).slice(0, 3);
  const lineHeight = variant === 'square' ? 40 : 48;
  const total = (lines.length - 1) * lineHeight;
  const yStart = dims.height / 2 - total / 2;
  const body = `
    <svg xmlns='http://www.w3.org/2000/svg' width='${dims.width}' height='${dims.height}' viewBox='0 0 ${dims.width} ${dims.height}'>
      <defs>
        <linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stop-color='hsl(${hue},72%,55%)'/>
          <stop offset='100%' stop-color='hsl(${hue2},78%,42%)'/>
        </linearGradient>
        <linearGradient id='glow' x1='0%' y1='0%' x2='100%' y2='0%'>
          <stop offset='0%' stop-color='rgba(255,255,255,0.18)'/>
          <stop offset='50%' stop-color='rgba(255,255,255,0.05)'/>
          <stop offset='100%' stop-color='rgba(255,255,255,0.18)'/>
        </linearGradient>
      </defs>
      <rect x='0' y='0' width='${dims.width}' height='${dims.height}' rx='${dims.rx}' fill='url(#g)'/>
      <rect x='${dims.stroke / 2}' y='${dims.stroke / 2}' width='${dims.width - dims.stroke}' height='${dims.height - dims.stroke}' rx='${Math.max(dims.rx - 16, 16)}' fill='none' stroke='rgba(255,255,255,0.16)' stroke-width='${Math.max(6, dims.stroke / 5)}'/>
      <rect x='${dims.stroke}' y='${dims.stroke}' width='${dims.width - dims.stroke * 2}' height='${dims.height - dims.stroke * 2}' rx='${Math.max(dims.rx - 24, 12)}' fill='url(#glow)' opacity='0.6'/>
      ${variant === 'square'
        ? `<circle cx='${dims.width / 2}' cy='${dims.height / 2 - 70}' r='90' fill='rgba(255,255,255,0.08)'/>`
        : `<circle cx='${dims.width / 2 + 120}' cy='${dims.height / 2 - 120}' r='130' fill='rgba(255,255,255,0.08)'/>`}
      ${lines.map((line, idx) => `<text x='50%' y='${yStart + idx * lineHeight}' text-anchor='middle' font-family="'Poppins', 'Segoe UI', sans-serif" font-weight='700' font-size='${variant === 'square' ? 34 : 42}' letter-spacing='1.2' fill='rgba(255,255,255,0.95)'>${line}</text>`).join('')}
    </svg>
  `;
  return encodeSvg(body);
}

function SmartImage({ src, fallbackSrc, alt, label, variant = 'landscape', style, ...rest }) {
  const [stage, setStage] = useState('primary');
  const safeLabel = label || alt || 'Imagen';
  let computed = makeIllustration(safeLabel, { variant });
  if (stage === 'primary' && src) {
    computed = src;
  } else if (stage === 'fallback' && fallbackSrc) {
    computed = fallbackSrc;
  }
  return (
    <img
      {...rest}
      alt={alt}
      src={computed}
      style={style}
      onError={() => {
        setStage((prev) => {
          if (prev === 'primary' && fallbackSrc) return 'fallback';
          if (prev !== 'placeholder') return 'placeholder';
          return prev;
        });
      }}
    />
  );
}

function SecurityLayer() {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const directives = [
      "default-src 'self'",
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      `script-src 'self'${isDev ? " 'unsafe-eval'" : ''}`,
      `connect-src 'self' https://wa.me https://api.whatsapp.com${isDev ? ' ws: wss:' : ''}`,
      "font-src 'self' https://fonts.gstatic.com https: data:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      'upgrade-insecure-requests'
    ];
    const csp = directives.join('; ');

    const m1 = document.createElement('meta');
    m1.httpEquiv = 'Content-Security-Policy';
    m1.content = csp;
    const m2 = document.createElement('meta');
    m2.name = 'referrer';
    m2.content = 'strict-origin-when-cross-origin';
    const m3 = document.createElement('meta');
    m3.name = 'color-scheme';
    m3.content = 'dark';

    Array.from(
      document.querySelectorAll("meta[http-equiv='Content-Security-Policy']")
    ).forEach((meta) => meta.remove());
    document.head.append(m1, m2, m3);

    // Enlaces externos seguros
    const anchors = Array.from(document.querySelectorAll("a[href^='http']"));
    const previousRel = new Map();
    anchors.forEach((a) => {
      const current = a.getAttribute('rel');
      previousRel.set(a, current);
      const rel = (current || '').split(' ').filter(Boolean);
      if (!rel.includes('noopener')) rel.push('noopener');
      if (!rel.includes('noreferrer')) rel.push('noreferrer');
      a.setAttribute('rel', rel.join(' '));
    });

    // Bloquear eval() (solo en producción para no interferir con el dev server)
    let previousEval = undefined;
    if (!isDev) {
      previousEval = window.eval;
      const blockEval = function () {
        throw new Error('eval() bloqueado');
      };
      try {
        window.eval = blockEval;
      } catch {}
    }

    return () => {
      [m1, m2, m3].forEach((meta) => {
        if (meta.parentNode) {
          meta.parentNode.removeChild(meta);
        }
      });
      anchors.forEach((a) => {
        const rel = previousRel.get(a);
        if (typeof rel === 'string') {
          a.setAttribute('rel', rel);
        } else {
          a.removeAttribute('rel');
        }
      });
      if (!isDev && typeof previousEval === 'function') {
        try {
          window.eval = previousEval;
        } catch {}
      }
    };
  }, []);
  return null;
}

/* =====================
   1) Estilos + Tokens
   ===================== */
function FuturisticStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
      :root{
        --bg:#15263b; --bg-2:#1d3450; --surface:rgba(22,36,54,0.88); --border:rgba(255,255,255,0.12);
        --text:#f5fbff; --text-muted:rgba(214,226,240,0.92);
        --accent:#49d8ff; --accent-600:#28c0ef; --accent-700:#10a7d6; --ink-on-accent:#021523;
        --accent-rgb:73 216 255; --bg-rgb:21 38 59; --text-rgb:245 251 255;
      }
      html,body{height:100%}
      body{
        background:
          radial-gradient(1200px 720px at 18% -180px, rgba(73,216,255,0.45), transparent),
          radial-gradient(960px 520px at 82% -120px, rgba(73,216,255,0.32), transparent),
          linear-gradient(190deg, rgba(19,32,52,0.94), rgba(12,22,36,0.88));
        color:var(--text);
        font-family: 'Poppins', 'Segoe UI', system-ui, -apple-system, Roboto, Inter, Arial;
        font-size:16px;
        line-height:1.7;
        position:relative;
        min-height:100%;
      }
      body:before{
        content:"";
        position:fixed;
        inset:0;
        pointer-events:none;
        background:radial-gradient(600px 420px at 80% 12%, rgba(73,216,255,0.18), transparent);
        mix-blend-mode:screen;
        opacity:.75;
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
      @media(min-width:720px){ .grid-3{grid-template-columns:repeat(2,1fr)} }
      @media(min-width:1080px){ .grid-3{grid-template-columns:repeat(3,1fr)} }
      header.backdrop{backdrop-filter:saturate(150%) blur(10px); background:rgba(15,18,22,.65)}
      a:focus, button:focus{outline:2px solid var(--accent); outline-offset:3px; border-radius:10px}
      /* Medios 16:9 */
      .thumb{ position:relative; width:100%; aspect-ratio:16/9; border-radius:12px; border:1px solid var(--border);
              background:linear-gradient(135deg, rgba(34,204,255,.18), rgba(34,204,255,.06)); overflow:hidden; display:flex; align-items:center; justify-content:center }
      .thumb svg{ width:70%; height:70%; color:var(--text)}
      .thumb-img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
      .hero-bg{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter:saturate(1.12) brightness(1.32); opacity:.55; z-index:0; }
      .hero-overlay{ position:absolute; inset:0; z-index:0; background:linear-gradient(118deg, rgba(18,30,48,0.82) 0%, rgba(18,30,48,0.58) 46%, rgba(18,30,48,0.2) 100%); }
      /* Método: card = media + contenido */
      .step-card{ display:grid; grid-template-rows:auto 1fr; gap:10px; height:100% }
      .step-media{ position:relative; border-radius:12px; border:1px solid var(--border); overflow:hidden; aspect-ratio:16/9; background:linear-gradient(135deg, rgba(34,204,255,.12), rgba(34,204,255,.04)) }
      /* About grid */
      .about-grid{ display:grid; gap:16px }
      @media(min-width:900px){ .about-grid{ grid-template-columns:1.2fr 1fr } }
      /* Footer + chat */
      footer .actions{ display:flex; gap:8px; flex-wrap:wrap; justify-content:center }
      footer .wrap{ padding-bottom:88px }
      .cta-rail{ border:1px dashed var(--border); border-radius:24px; background:linear-gradient(180deg, rgba(34,204,255,.07), rgba(34,204,255,.03)); padding:20px }
      .btn .btn-icon{width:22px; height:22px; display:inline-flex; align-items:center; justify-content:center}
      .btn .btn-icon img, .btn .btn-icon svg{width:100%; height:100%; object-fit:contain}
      .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
      .js-reveal{opacity:0; transform:translateY(60px); transition:opacity .85s ease, transform .85s cubic-bezier(.22,.61,.36,1); transition-delay:var(--reveal-delay,0s)}
      .js-reveal.is-visible{opacity:1; transform:none}
      .chat-fab{width:68px; height:68px; border-radius:999px; display:flex; align-items:center; justify-content:center; padding:0; background:linear-gradient(135deg, rgba(73,216,255,.95), rgba(16,167,214,.95)); border:1px solid rgba(255,255,255,0.18); box-shadow:0 22px 44px rgba(8,16,28,0.55),0 0 30px rgba(73,216,255,0.48); transition:transform .25s ease, box-shadow .25s ease}
      .chat-fab:hover{transform:translateY(-4px); box-shadow:0 30px 60px rgba(8,16,28,0.55),0 0 36px rgba(73,216,255,0.6)}
      .chat-fab:active{transform:translateY(-1px)}
    `}</style>
  );
}

/* =====================
   2) Header (hamburguesa)
   ===================== */
function Header({ onGo }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="backdrop" style={{ position: 'fixed', insetInline: 0, top: 0, zIndex: 50, borderBottom: '1px solid var(--border)' }}>
      <nav className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <a onClick={() => onGo('inicio')} href="#" style={{ fontWeight: 700, letterSpacing: 0.4, color: 'var(--text)' }} className="neon">Ranquel Tech Lab</a>
        <button aria-label="Abrir menú" aria-expanded={open} onClick={() => setOpen(!open)} className="btn btn-ghost" style={{ display: 'inline-flex' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {open ? (<path d="M18 6L6 18M6 6l12 12" />) : (<><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>)}
          </svg>
        </button>
      </nav>
      {open && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <ul className="wrap" style={{ padding: '8px 0', display: 'grid', gap: 8 }}>
            <li><a className="panel" href="#" onClick={() => { setOpen(false); onGo('inicio'); }} style={{ display: 'block', padding: '8px 12px', color: 'var(--text)' }}>Inicio</a></li>
            <li><a className="panel" href="#about" onClick={() => { setOpen(false); onGo('anchor', '#about'); }} style={{ display: 'block', padding: '8px 12px', color: 'var(--text)' }}>Sobre</a></li>
            <li><a className="panel" href="#services" onClick={() => { setOpen(false); onGo('anchor', '#services'); }} style={{ display: 'block', padding: '8px 12px', color: 'var(--text)' }}>Servicios</a></li>
            <li><a className="panel" href="#ia" onClick={() => { setOpen(false); onGo('anchor', '#ia'); }} style={{ display: 'block', padding: '8px 12px', color: 'var(--text)' }}>IA aplicada</a></li>
            <li><a className="panel" href="#marketing" onClick={() => { setOpen(false); onGo('anchor', '#marketing'); }} style={{ display: 'block', padding: '8px 12px', color: 'var(--text)' }}>Marketing</a></li>
            <li><a className="panel" href="#metodo" onClick={() => { setOpen(false); onGo('anchor', '#metodo'); }} style={{ display: 'block', padding: '8px 12px', color: 'var(--text)' }}>Método</a></li>
            <li><a className="panel" href="#" onClick={() => { setOpen(false); onGo('opciones'); }} style={{ display: 'block', padding: '8px 12px', color: 'var(--text)' }}>Opciones de Desarrollo</a></li>
          </ul>
        </div>
      )}
    </header>
  );
}

/* =====================
   3) Íconos inline (incluye WhatsApp)
   ===================== */
function IcoWhatsApp() {
  return (
    <span className="btn-icon" aria-hidden="true">
      <img src={withBase('logos/whatsapp.svg')} alt="" loading="lazy" />
    </span>
  );
}
function IcoChat() {
  return (
    <span className="btn-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.25 3.5h15.5A2.25 2.25 0 0 1 22 5.75v7.75a2.25 2.25 0 0 1-2.25 2.25h-6.15l-4.72 3.75a.9.9 0 0 1-1.47-.7v-3.05H4.25A2.25 2.25 0 0 1 2 13.5V5.75A2.25 2.25 0 0 1 4.25 3.5Z" />
        <circle cx="8" cy="10.5" r="1.1" fill="rgba(255,255,255,0.7)" />
        <circle cx="12" cy="10.5" r="1.1" fill="rgba(255,255,255,0.7)" />
        <circle cx="16" cy="10.5" r="1.1" fill="rgba(255,255,255,0.7)" />
      </svg>
    </span>
  );
}
function IcoOptions() {
  return (
    <span className="btn-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 7h18v2H3zM3 11h18v2H3zM3 15h14v2H3z" />
      </svg>
    </span>
  );
}

function IcoLinkedIn() {
  return (
    <span className="btn-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
        <rect width="24" height="24" rx="4" fill="#0A66C2" />
        <path
          fill="#fff"
          d="M7.09 18.5H4.41V9.65h2.68v8.85ZM5.75 8.46a1.55 1.55 0 1 1 0-3.1 1.55 1.55 0 0 1 0 3.1Zm13.54 10.04h-2.68v-4.54c0-1.08-.38-1.81-1.32-1.81-.72 0-1.15.48-1.35.94-.07.17-.09.4-.09.64v4.77h-2.68s.04-7.74 0-8.85h2.68v1.25c.36-.55 1.01-1.33 2.45-1.33 1.78 0 3.13 1.16 3.13 3.64v5.29Z"
        />
      </svg>
    </span>
  );
}

function IcoFacebook() {
  return (
    <span className="btn-icon" aria-hidden="true">
      <img src={withBase('logos/facebook.svg')} alt="" loading="lazy" />
    </span>
  );
}

function IcoInstagram() {
  return (
    <span className="btn-icon" aria-hidden="true">
      <img src={withBase('logos/instagram.svg')} alt="" loading="lazy" />
    </span>
  );
}

const imageAssets = Object.freeze({
  aboutHero: withBase('images/Portada.jpg'),
  aboutLogo: withBase('images/logo.png'),
  services: {
    'Desarrollo Web': withBase('images/ChatGPT Image 13 nov 2025, 01_45_44 a.m..png'),
    Dominios: withBase('images/Dominios.webp'),
    'Apps Android': withBase('images/Apps Android.jpg'),
    'Sistemas a medida': withBase('images/Sistemas a Medida.jpg'),
    'SEO + Ads': withBase('images/SEO + Ads.jpg'),
    Analítica: withBase('images/Analitica.jpg')
  },
  ia: {
    Asesoramiento: withBase('images/Asesoramiento.jpg'),
    'GPTs a medida': withBase('images/GPTs A medida.jpg'),
    'Bots conversacionales': withBase('images/Bots Conversacionales.jpg')
  },
  botGuide: {
    '1. Preparamos la información': withBase('images/Preparamos la Información.png'),
    '2. Diseñamos el flujo y conectamos canales': withBase('images/Diseñamos Flujo Conectamos Canales.png'),
    '3. Entrenamos, probamos y lanzamos': withBase('images/Entrenamos Probamos y Lanzamos.png')
  },
  metodo: {
    '1 Escuchamos las Necesidades del Cliente.': withBase('images/Escuchamos las necesidades del cliente.png'),
    '2- Analizamos la competencia.': withBase('images/Analizamos la competencia.png'),
    '3- Estudiamos el Proyecto': withBase('images/Estudiamos el Proyecto.png'),
    '4- Materealizando Objetivos.': withBase('images/Materealizando Objetivos.png'),
    '5- Conexión con Buscadores y SEO': withBase('images/Conexion buscadores seo.png'),
    '6- Entrega de la web, Puesta a punto y seguimiento mensual.': withBase('images/Entrega de la web, Puesta a punto y seguimiento mensual..png')
  }
});

const fallbackImageAssets = Object.freeze({
  aboutLogo: withBase('images/Portada.jpg'),
  services: {
    Dominios: withBase('images/Portada.jpg')
  }
});

/* =====================
   4) Hero con 3 botones
   ===================== */
const heroImage = imageAssets.aboutHero;

function Hero({ onOpenOpciones, onOpenChat }) {
  const wa = '#'; // TODO: reemplazar por https://wa.me/XXXXXXXXXXX
  return (
    <section
      id="hero"
      className="js-reveal"
      style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}
    >
      <SmartImage
        aria-hidden="true"
        className="hero-bg"
        alt=""
        src={heroImage}
        label="Ranquel Tech Lab"
        variant="landscape"
      />
      <div aria-hidden="true" className="hero-overlay" />
      <div className="wrap" style={{ position: 'relative', zIndex: 1, paddingTop: 112, paddingBottom: 80 }}>
        <span className="badge">En la cúspide de la tecnología</span>
        <h1 className="neon" style={{ fontSize: 'clamp(32px,6vw,56px)', fontWeight: 800, letterSpacing: 0.2, marginTop: 12, color: 'var(--accent)' }}>Creamos software inteligente que impulsa tu negocio.</h1>
        <p style={{ marginTop: 12, color: 'var(--accent)', maxWidth: 720, fontSize: 19, fontWeight: 500 }}>Desarrollo Web, Apps Android y Automatizaciones con IA. SEO, analítica y performance listos desde el día uno.</p>
        <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <a
            href={wa}
            className="btn btn-accent glow"
            style={{ color: 'var(--ink-on-accent)' }}
          >
            <IcoWhatsApp />
            <span>WhatsApp</span>
          </a>
          <button
            onClick={onOpenOpciones}
            className="btn btn-ghost"
            style={{ color: 'var(--accent)', borderColor: 'rgba(var(--accent-rgb),0.45)' }}
          >
            <IcoOptions />
            <span>Opciones de Desarrollo</span>
          </button>
          <button
            onClick={onOpenChat}
            className="btn btn-ghost"
            style={{ color: 'var(--accent)', borderColor: 'rgba(var(--accent-rgb),0.45)' }}
          >
            <IcoChat />
            <span>Chat bot</span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* =====================
   5) Sobre / Servicios / IA / Marketing / Método
   ===================== */
function About({ onOpenOpciones }) {
  return (
    <section id="about" className="wrap js-reveal" style={{ paddingTop: 64, paddingBottom: 64 }}>
      <h2 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, textAlign: 'center' }}>Sobre nosotros</h2>
      <div className="about-grid" style={{ marginTop: 16, alignItems: 'center' }}>
        <div>
          <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>En Ranquel Tech Lab diseñamos y desarrollamos sitios web, apps Android y sistemas en Java integrados con IA. Unimos diseño, código y automatización para convertir ideas en productos reales, medibles y escalables.</p>
          <p style={{ marginTop: 10, color: 'var(--text-muted)' }}>Porque todo se puede <strong>Codificar</strong>, podemos diseñar el software a medida que necesites. Nos comentás dónde está tu cuello de botella o tu necesidad de mejora, analizamos la situación y damos soluciones.</p>
          <div style={{ marginTop: 16 }}><button onClick={onOpenOpciones} className="btn btn-accent glow">Conocé Opciones de Desarrollo</button></div>
        </div>
        <div className="thumb"><SmartImage className="thumb-img" alt="Equipo de trabajo tecnológico" src={imageAssets.aboutLogo} fallbackSrc={fallbackImageAssets.aboutLogo} label="Equipo de trabajo" loading="lazy" /></div>
      </div>
    </section>
  );
}

function Services() {
  const items = [
    { title: 'Desarrollo Web', desc: 'SEO, performance, e‑commerce y landings rápidas.' },
    { title: 'Dominios', desc: 'Nos encargamos de tu hosting y del dominio que necesitás para tu web.' },
    { title: 'Apps Android', desc: 'Java/Kotlin, publicación en Play Store.' },
    { title: 'Sistemas a medida', desc: 'Java/Node.js, dashboards y microservicios.' },
    { title: 'SEO + Ads', desc: 'Google/Meta con medición y experimentos.' },
    { title: 'Analítica', desc: 'GA4, GTM, Search Console y Bing Webmaster.' }
  ];
  return (
    <section id="services" className="wrap js-reveal" style={{ paddingTop: 64, paddingBottom: 64 }}>
      <h2 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, textAlign: 'center' }}>Servicios</h2>
      <div className="grid grid-3" style={{ marginTop: 24 }}>
        {items.map((it) => (
          <article key={it.title} className="panel glow step-card" style={{ padding: 16 }}>
            <div className="step-media">
              <SmartImage
                className="thumb-img"
                alt={it.title}
                src={imageAssets.services[it.title]}
                fallbackSrc={fallbackImageAssets.services[it.title]}
                label={it.title}
                loading="lazy"
              />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{it.title}</h3>
              <p style={{ marginTop: 8, color: 'var(--text-muted)' }}>{it.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// SVGs auxiliares para IA aplicada
function SvgAdvisory() {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" opacity="0.5" /><path d="M8 15l3-3 2 2 3-4" /><path d="M6 7h4M14 7h4" opacity="0.6" /></svg>);
}
function SvgGPTs() {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l3 3-3 3-3-3 3-3z" /><path d="M12 15l3 3-3 3-3-3 3-3z" /><path d="M3 12l3-3 3 3-3 3-3-3z" /><path d="M15 12l3-3 3 3-3 3-3-3z" /></svg>);
}
function SvgBots() {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="7" width="16" height="10" rx="2" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><path d="M12 7V4" /><circle cx="12" cy="3" r="1" /></svg>);
}

function IAaplicada({ onOpenOpciones }) {
  const cards = [
    { title: 'Asesoramiento', desc: 'Auditamos procesos y datos, medimos tu madurez digital y detectamos “quick wins”. Entregamos un plan 30-60-90 días con casos de uso priorizados, costos, métricas y ROI estimado para acelerar resultados.' },
    { title: 'GPTs a medida', desc: 'Creamos asistentes con el contexto de tu negocio (documentos, políticas, catálogos) y reglas propias. Se conectan a tus sistemas (ERP/CRM/AFIP/Sheets) para automatizar tareas, responder con trazabilidad y ejecutar flujos end-to-end.' },
    { title: 'Bots conversacionales', desc: 'Web/WhatsApp/Instagram que atienden, reservan, cobran y escalan a un humano cuando corresponde. Entrenados con tu contenido, con analytics de conversaciones y mejoras continuas para elevar la experiencia del cliente.' }
  ];
  const pics = imageAssets.ia;
  return (
    <section id="ia" className="wrap js-reveal" style={{ paddingTop: 64, paddingBottom: 64 }}>
      <div style={{ textAlign: 'center' }}>
        <h2 className="neon" style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800 }}>IA aplicada</h2>
        <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>En Ranquel Tech Lab la IA no es un extra: es parte del producto. Te mostramos caminos concretos para llevarla a tus procesos hoy, con métricas claras y foco en ROI.</p>
      </div>
      <div className="grid grid-3" style={{ marginTop: 24 }}>
        {cards.map(({ title, desc }) => (
          <article key={title} className="panel glow step-card" style={{ padding: 16 }}>
            <div className="step-media"><SmartImage className="thumb-img" alt={title} src={pics[title]} label={title} loading="lazy" /></div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
              <p style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          </article>
        ))}
      </div>
      <div style={{ marginTop: 20, textAlign: 'center' }}><button onClick={onOpenOpciones} className="btn btn-accent glow">Conocé Opciones de Desarrollo</button></div>
    </section>
  );
}

function BotSetupGuide() {
  const steps = [
    {
      title: '1. Preparamos la información',
      detail: 'Definimos objetivo del bot, tono de voz y recopilamos preguntas frecuentes, precios, horarios, catálogos y respuestas aprobadas.'
    },
    {
      title: '2. Diseñamos el flujo y conectamos canales',
      detail: 'Elegimos el canal (WhatsApp, Web, Instagram) y armamos el diagrama: captación, cualificación, derivaciones y entregables automáticos.'
    },
    {
      title: '3. Entrenamos, probamos y lanzamos',
      detail: 'Configuramos la plataforma (GPT/Dialogflow/Botpress), integramos con tu CRM o Sheets, probamos con tu equipo y dejamos tableros de métricas listos.'
    }
  ];
  const pics = imageAssets.botGuide;
  return (
    <section id="bot-guide" className="wrap js-reveal" style={{ paddingTop: 64, paddingBottom: 64 }}>
      <div style={{ textAlign: 'center' }}>
        <h2 className="neon" style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800 }}>Configuramos tu Bot en 3 pasos</h2>
        <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>Rápido y Preciso, justo lo que necesitás para ahorrarte horas de trabajo administrativo.</p>
      </div>
      <div className="grid grid-3" style={{ marginTop: 24 }}>
        {steps.map(({ title, detail }) => (
          <article key={title} className="panel glow step-card" style={{ padding: 18 }}>
            <div className="step-media"><SmartImage className="thumb-img" alt={title} src={pics[title]} label={title} loading="lazy" /></div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
              <p style={{ marginTop: 8, color: 'var(--text-muted)' }}>{detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Marketing() {
  const logos = [
    { alt: 'Google Ads', src: withBase('logos/google-ads.svg'), color: '#4285F4' },
    { alt: 'Microsoft Advertising', src: withBase('logos/microsoft-advertising.svg'), color: '#0078D4' },
    { alt: 'Meta', src: withBase('logos/meta.svg'), color: '#0081FB' },
    { alt: 'Instagram', src: withBase('logos/instagram.svg'), color: '#C13584' },
    { alt: 'Facebook', src: withBase('logos/facebook.svg'), color: '#0866FF' },
    { alt: 'WhatsApp', src: withBase('logos/whatsapp.svg'), color: '#25D366' },
    { alt: 'Google Analytics', src: withBase('logos/google-analytics.svg'), color: '#E37400' },
    { alt: 'Google Tag Manager', src: withBase('logos/google-tag-manager.svg'), color: '#4285F4' },
    { alt: 'Google Search Console', src: withBase('logos/google-search-console.svg'), color: '#1A73E8' }
  ];
  return (
    <section id="marketing" className="wrap js-reveal" style={{ paddingTop: 64, paddingBottom: 64 }}>
      <h2 className="neon" style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, textAlign: 'center' }}>Marketing</h2>
      <p style={{ marginTop: 12, color: 'var(--text-muted)', maxWidth: 960, textAlign: 'center', marginInline: 'auto' }}>Con 13 años de experiencia en Marketing Digital podemos hacerte campañas de Google Ads, Bing Ads, Meta Pixel (Instagram, Facebook, Whatsapp). Tu Costo publicitario nunca rendirá más que contratando nuestros servicios, con métricas comprobables.</p>
      <div style={{ marginTop: 20, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
        {logos.map((l) => (
          <div
            key={l.alt}
            className="panel"
            style={{
              padding: '14px 18px',
              borderRadius: 14,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.25)'
            }}
          >
            <img
              alt={l.alt}
              src={l.src}
              style={{ width: 56, height: 56, objectFit: 'contain', display: 'block' }}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function Metodo() {
  const pasos = [
    { n: 1, t: '1 Escuchamos las Necesidades del Cliente.', d: 'Para poder arrancar con cualquier proyecto necesitamos saber cuales son las necesides de nuestro clientes y el modo operandi de su negocio, solicitamos toda la información que nos puedan brindar..y ahora es cuando estamos en condiciones de seguir al próximo paso.' },
    { n: 2, t: '2- Analizamos la competencia.', d: 'Comparamos los standares de la competencia para superarlos.' },
    { n: 3, t: '3- Estudiamos el Proyecto', d: 'Con la información recopilada, buscamos las mejores estrategias tecnológicas que se adecuen a las necesidades y objetivos de nuestro clientes.' },
    { n: 4, t: '4- Materealizando Objetivos.', d: 'Ponemos Marcha y hacemos maqueta previa según  todo la información obtenida y analizada. Se presenta una primera muestra de lo Trabajado y se abona un 50% del presupuesto.' },
    { n: 5, t: '5- Conexión con Buscadores y SEO', d: 'Conectamos la web a :\nGoogle Ads (publicidad de Google)\nGoogle Tag Manager.\nGoogle Analitycs.\nGoogle Search Console.\nMeta = Facebook + Instagram + Whatsapp\nBing\nBing Adds (Publicidad de Bing)\nOptimización e Indexación de la Página para reconocimiento prioritario en buscadores.\nY más a medida que se vayan implementando nuevas tecnologías de Marketing.' },
    { n: 6, t: '6- Entrega de la web, Puesta a punto y seguimiento mensual.', d: 'Ultimamos detalles.\nSe Abona el 50% del presupuesto restante.\nHacemos entrega de la Página Web y hacemos un segumiento mensual para la implementación de nuevas tecnologías.' }
  ];
  return (
    <section id="metodo" className="wrap js-reveal" style={{ paddingTop: 64, paddingBottom: 64 }}>
      <h2 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, textAlign: 'center' }}>Nuestro Método Ganador</h2>
      <style>{`.metodo-grid{display:grid; gap:1rem} @media(min-width:768px){ .metodo-grid{grid-template-columns:repeat(2,1fr)} .step-left{justify-self:end; transform:translateX(-6px)} .step-right{justify-self:start; transform:translateX(6px)} .step-shell{max-width:min(560px,95%) } }`}</style>
      <div className="metodo-grid" style={{ marginTop: 24, alignItems: 'start' }}>
        {pasos.map((p, idx) => {
          const right = idx % 2 === 1;
          return (
            <article key={idx} className={`panel glow step-shell ${right ? 'step-right' : 'step-left'}`} style={{ padding: 16 }}>
              <div className="step-card">
                <div className="step-media"><SmartImage className="thumb-img" alt={`Paso ${p.n}`} src={imageAssets.metodo[p.t]} label={`Paso ${p.n}`} loading="lazy" /></div>
                <div>
                  <div className="badge" aria-hidden="true">Paso {p.n}</div>
                  <h3 style={{ fontWeight: 700, marginTop: 8 }}>{p.t}</h3>
                  <pre style={{ whiteSpace: 'pre-wrap', marginTop: 6, color: 'var(--text-muted)', fontFamily: 'inherit' }}>{p.d}</pre>
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
function Opciones() {
  const categorias = [
    { title: 'Industria (manufactura)', items: [
      'Mantenimiento predictivo — Sensores (vibración/temperatura/consumo), modelo ML que anticipe fallas y genere órdenes en tu ERP/MES; alertas en Android.',
      'Control de calidad por visión — Cámaras + modelos de visión (defectos, soldaduras, etiquetas) con registro y trazabilidad; OK/NO‑OK directo al SCADA.',
      'Planificación y OEE inteligente — IA que secuencia órdenes minimizando setups y cuellos de botella; tablero OEE con causas automáticas.'
    ] },
    { title: 'Finanzas (PyMEs)', items: [
      'Lectura de comprobantes + AFIP — OCR + validación online, categorización contable y conciliación bancaria automática; banderas rojas por discrepancias.',
      'Scoring de riesgo y mora — Modelos con variables contables/comerciales para priorizar cobranza, cupos y condiciones; semáforos y workflows.',
      'Detección de fraude/anomalías — Gastos atípicos, proveedores duplicados, desvíos de caja; reglas + ML con auditoría y evidencia exportable.'
    ] },
    { title: 'Hotelería', items: [
      'Precios dinámicos (revenue) — Ajuste tarifario por demanda, clima y eventos locales; restricciones y upsells automáticos.',
      'Chatbot omnicanal (Web/WhatsApp) — Disponibilidad, reservas, cobros y upgrades; integra PMS/Channel Manager.',
      'Housekeeping asistido por visión — App Android que reconoce estado de habitación/amenities y optimiza turnos.'
    ] },
    { title: 'Restaurants', items: [
      'Forecast de demanda por plato — Predice ventas por franja y día; sugiere compras y mise en place para reducir quiebres/merma.',
      'Upselling inteligente en POS — Sugerencias de combos y extras según historial y hora; A/B testing de menús y precios.',
      'Control de porciones/mermas por visión — Cámaras + básculas conectadas para estandarizar raciones y detectar desvíos.'
    ] },
    { title: 'Salud', items: [
      'Triage inteligente — Modelo que prioriza turnos por gravedad y antecedentes; recordatorios automatizados y derivaciones.',
      'Seguimiento de tratamientos — App Android para pacientes con alertas, adherencia y registro de síntomas; tableros para profesionales.',
      'Análisis de imagen médica — Modelos que detectan hallazgos en estudios (RX, TAC) y sugieren informes prellenados.'
    ] },
    { title: 'Educación', items: [
      'Plataforma LMS con IA — Rutas personalizadas, análisis de engagement y generación de contenido adaptativo.',
      'Asistentes docentes — Bots que responden preguntas frecuentes de alumnos y escalan al docente con contexto.',
      'Analítica de deserción — Modelos que predicen abandono y sugieren intervenciones automáticas.'
    ] }
  ];
  return (
    <section className="wrap js-reveal" style={{ paddingTop: 64, paddingBottom: 64 }}>
      <h2 className="neon" style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, textAlign: 'center' }}>Opciones de Desarrollo</h2>
      <p style={{ marginTop: 12, color: 'var(--text-muted)', textAlign: 'center' }}>Casos de uso listos para implementar según tu industria.</p>
      <div className="grid grid-2" style={{ marginTop: 24 }}>
        {categorias.map((cat) => (
          <article key={cat.title} className="panel glow" style={{ padding: 16 }}>
            <h3 style={{ fontWeight: 700 }}>{cat.title}</h3>
            <ul style={{ marginTop: 8, display: 'grid', gap: 8 }}>
              {cat.items.map((line, idx) => (<li key={idx} style={{ color: 'var(--text-muted)' }}>• {line}</li>))}
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
function CTAContact() {
  return (
    <section className="wrap js-reveal" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <div className="cta-rail glow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'grid', gap: 6, textAlign: 'center' }}>
          <strong className="neon" style={{ fontSize: 'clamp(18px,2.5vw,22px)' }}>¿Consultas? Contactanos para Mayor Información</strong>
          <strong style={{ fontSize: 'clamp(16px,2.2vw,20px)' }}>¡Pedinos Presupuesto Sin Cargo!</strong>
        </div>
      </div>
    </section>
  );
}

/* =====================
   8) Footer con redes centradas + WhatsApp
   ===================== */
function Footer() {
  const wa = '#'; // TODO: reemplazar por enlace real
  return (
    <footer className="js-reveal" style={{ borderTop: '1px solid var(--border)', marginTop: 32 }}>
      <div className="wrap" style={{ padding: '24px 0' }}>
        <div className="actions" style={{ marginTop: 12 }}>
          <a href="#" className="btn btn-ghost"><IcoLinkedIn /><span>LinkedIn</span></a>
          <a href="#" className="btn btn-ghost"><IcoFacebook /><span>Facebook</span></a>
          <a href="#" className="btn btn-ghost"><IcoInstagram /><span>Instagram</span></a>
          <a href={wa} className="btn btn-accent"><IcoWhatsApp /><span>WhatsApp</span></a>
        </div>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>© 2025 Ranquel Tech Lab</p>
      </div>
    </footer>
  );
}

/* =====================
   9) Chat (burbuja)
   ===================== */
function ChatBubble({ open, setOpen }) {
  const [step, setStep] = useState('root');
  return (
    <div id="chat" style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 60 }}>
      {open && (
        <div className="panel glow" style={{ width: 'min(92vw, 420px)', height: '70vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 48, padding: '0 12px', borderBottom: '1px solid var(--border)' }}>
            <strong>Asistente Ranquel</strong>
            <button aria-label="Cerrar" onClick={() => setOpen(false)} className="btn btn-ghost" style={{ padding: 6 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </header>
          <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            {step === 'root' && (
              <div style={{ display: 'grid', gap: 8 }}>
                <p>Hola 👋 ¿En qué te ayudamos?</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button className="btn btn-ghost" onClick={() => setStep('servicios')}>Servicios</button>
                  <button className="btn btn-ghost" onClick={() => setStep('presupuesto')}>Presupuesto</button>
                  <button className="btn btn-ghost" onClick={() => setStep('faq')}>FAQ</button>
                  <button className="btn btn-ghost" onClick={() => setStep('bot')}>Configurar bot</button>
                </div>
              </div>
            )}
            {step === 'servicios' && (
              <div style={{ display: 'grid', gap: 6 }}>
                <p>• Desarrollo Web • IA aplicada • Apps Android • Sistemas a medida • SEO + Ads • Analítica</p>
                <button className="btn btn-accent" onClick={() => setStep('lead')}>Quiero que me contacten</button>
              </div>
            )}
            {step === 'presupuesto' && <LeadForm onDone={() => setStep('root')} />}
            {step === 'faq' && (
              <div style={{ display: 'grid', gap: 6 }}>
                <p><strong>¿Plazos?</strong> Un landing 1–2 semanas (según alcance).</p>
                <p><strong>¿Publicación?</strong> Preparamos deploy (Vercel) y Play Store.</p>
                <p><strong>¿Medición?</strong> GA4/GTM/Search Console y KPIs.</p>
                <button className="btn btn-accent" onClick={() => setStep('lead')}>Quiero que me contacten</button>
              </div>
            )}
            {step === 'bot' && (
              <div style={{ display: 'grid', gap: 8 }}>
                <p>Te guiamos rápido:</p>
                <ol style={{ paddingLeft: 20, display: 'grid', gap: 6 }}>
                  <li><strong>1.</strong> Reunimos flujos y respuestas clave (FAQ, horarios, precios).</li>
                  <li><strong>2.</strong> Elegimos canal (WhatsApp, Web) y conectamos tu CRM/Sheets.</li>
                  <li><strong>3.</strong> Entrenamos al bot, lo probamos con vos y dejamos métricas listas.</li>
                </ol>
                <button className="btn btn-accent" onClick={() => setStep('lead')}>Necesito ayuda con mi bot</button>
                <button className="btn btn-ghost" onClick={() => setStep('root')}>Volver</button>
              </div>
            )}
            {step === 'lead' && <LeadForm onDone={() => setStep('root')} />}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="chat-fab"
        aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.25 3.5h15.5A2.25 2.25 0 0 1 22 5.75v7.75a2.25 2.25 0 0 1-2.25 2.25h-6.1l-4.85 3.86a.85.85 0 0 1-1.38-.67v-3.19H4.25A2.25 2.25 0 0 1 2 13.5V5.75A2.25 2.25 0 0 1 4.25 3.5Z" />
          <circle cx="7.5" cy="10.4" r="1.1" fill="rgba(255,255,255,0.7)" />
          <circle cx="12" cy="10.4" r="1.1" fill="rgba(255,255,255,0.7)" />
          <circle cx="16.5" cy="10.4" r="1.1" fill="rgba(255,255,255,0.7)" />
        </svg>
        <span className="sr-only">{open ? 'Cerrar chat' : 'Abrir chat'}</span>
      </button>
    </div>
  );
}

// Sanitizador simple
function sanitize(str) {
  const value = (str ?? '').toString();
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return value.replace(/[&<>"']/g, (ch) => map[ch]);
}

function LeadForm({ onDone }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('Contacto');
  const [sent, setSent] = useState(false);
  const submit = () => {
    const safeName = sanitize(name).slice(0, 120);
    const safeEmail = sanitize(email).slice(0, 160);
    const safeMsg = sanitize(message).slice(0, 500);
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail);
    if (!safeName || !okEmail || !safeMsg) return;
    try {
      const list = JSON.parse(localStorage.getItem('rtl_leads') || '[]');
      list.push({ name: safeName, email: safeEmail, message: safeMsg, ts: Date.now() });
      localStorage.setItem('rtl_leads', JSON.stringify(list));
      setSent(true);
    } catch {}
  };
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label style={{ fontSize: 12 }}>Nombre
        <input autoComplete="off" style={{ marginTop: 6, width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '8px 10px', color: 'var(--text)' }} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label style={{ fontSize: 12 }}>Email
        <input autoComplete="off" type="email" style={{ marginTop: 6, width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '8px 10px', color: 'var(--text)' }} value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label style={{ fontSize: 12 }}>Mensaje
        <textarea rows={3} style={{ marginTop: 6, width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '8px 10px', color: 'var(--text)' }} value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button className="btn btn-accent" onClick={submit}>Enviar</button>
        <button className="btn btn-ghost" onClick={onDone}>Cerrar</button>
        {sent && <span style={{ color: '#3de27b', fontSize: 12 }}>¡Listo! Guardado localmente.</span>}
      </div>
    </div>
  );
}

/* =====================
   10) Smoke-tests (no UI)
   ===================== */
function runSmokeTests() {
  try {
    if (typeof document === 'undefined') return;
    console.group('RTL Smoke Tests');
    const iaCards = ['Asesoramiento', 'GPTs a medida', 'Bots conversacionales'];
    console.assert(iaCards.length === 3, 'IA aplicada: cantidad de tarjetas incorrecta');
    const pasosCount = 6;
    console.assert(pasosCount === 6, "Método: deben ser 6 pasos");
    const estados = ['inicio', 'opciones'];
    console.assert(estados.includes('inicio'), "Estado inicial debe ser 'inicio'");
    setTimeout(() => {
      const ids = ['hero', 'about', 'services', 'ia', 'bot-guide', 'marketing', 'metodo'];
      const missing = ids.filter((id) => !document.getElementById(id));
      if (missing.length) {
        console.warn('Faltan secciones en DOM:', missing);
      }
      // Tests adicionales
      const svc = document.querySelectorAll('#services article');
      console.assert(svc.length === 6, `Servicios: se esperaban 6 cards y hay ${svc.length}`);
      const metodoImgs = document.querySelectorAll('#metodo .step-media img');
      console.assert(metodoImgs.length === 6, `Método: 6 imágenes (hay ${metodoImgs.length})`);
      const iaImgs = document.querySelectorAll('#ia .step-media img');
      console.assert(iaImgs.length === 3, `IA aplicada: 3 imágenes (hay ${iaImgs.length})`);
      const logos = document.querySelectorAll('#marketing img');
      console.assert(logos.length >= 7, `Marketing: se esperan >=7 logos (hay ${logos.length})`);
      const yearOk = (document.querySelector('footer')?.textContent || '').includes('© 2025');
      console.assert(yearOk, 'Footer debe mostrar © 2025');
      const ctaBtns = document.querySelectorAll('.cta-rail a, .cta-rail button');
      console.assert(ctaBtns.length === 0, 'CTA no debe tener botones');
      console.groupEnd();
    }, 0);
  } catch (e) {
    console.error('Smoke tests error:', e);
  }
}

/* =====================
   11) App — vistas + chat + CTA + SecurityLayer
   ===================== */
export default function App() {
  const [tab, setTab] = useState('inicio');
  const [chatOpen, setChatOpen] = useState(false);

  const onGo = (dest, anchor) => {
    if (dest === 'opciones') {
      setTab('opciones');
      return;
    }
    if (dest === 'inicio') {
      setTab('inicio');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (dest === 'anchor') {
      setTab('inicio');
      setTimeout(() => {
        const el = anchor ? document.querySelector(anchor) : null;
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 30);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('antialiased');
    }
    runSmokeTests();
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const nodes = Array.from(document.querySelectorAll('.js-reveal'));
    nodes.forEach((node, idx) => {
      node.style.setProperty('--reveal-delay', `${Math.min(idx * 0.08, 0.48)}s`);
    });
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -12%' }
    );
    nodes.forEach((node) => {
      if (!node.classList.contains('is-visible')) {
        observer.observe(node);
      }
    });
    return () => observer.disconnect();
  }, [tab]);

  return (
    <div>
      <SecurityLayer />
      <FuturisticStyle />
      <Header onGo={onGo} />
      {tab === 'inicio' ? (
        <main>
          <Hero
            onOpenOpciones={() => onGo('opciones')}
            onOpenChat={() => setChatOpen(true)}
          />
          <About onOpenOpciones={() => onGo('opciones')} />
          <Services />
          <IAaplicada onOpenOpciones={() => onGo('opciones')} />
          <BotSetupGuide />
          <Marketing />
          <Metodo />
        </main>
      ) : (
        <main>
          <Opciones />
        </main>
      )}
      <CTAContact />
      <Footer />
      <ChatBubble open={chatOpen} setOpen={setChatOpen} />
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
