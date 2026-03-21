import { useCallback } from 'react';

const TOOLS = [
  { name: 'React', role: 'UI y estado' },
  { name: 'Vite', role: 'Build y dev server' },
  { name: 'AWS Lambda', role: 'Reglas de negocio' },
  { name: 'DynamoDB', role: 'Persistencia' },
  { name: 'API Gateway', role: 'API REST + CORS' },
  { name: 'AWS SAM', role: 'IaC y despliegue' },
];

const MARQUEE_ITEMS = [
  { cmd: 'reserva create lab-2', branch: 'main', plus: 47, minus: 3 },
  { cmd: 'cupos check hora-14', branch: 'feat/cupos', plus: 12, minus: 1 },
  { cmd: 'activas list --vigentes', branch: 'release', plus: 89, minus: 0 },
  { cmd: 'historial range --mes', branch: 'feat/historial', plus: 156, minus: 22 },
  { cmd: 'lambda validate-slot', branch: 'infra/sam', plus: 34, minus: 8 },
];

const STEPS = [
  {
    n: '01',
    title: 'Reserva',
    text: 'Completa correo, nombre, ID, laboratorio y bloque horario en el formulario.',
  },
  {
    n: '02',
    title: 'Validación',
    text: 'Lambda verifica cupos (máx. 7 por hora), horario 8:00–22:00 y datos obligatorios.',
  },
  {
    n: '03',
    title: 'Seguimiento',
    text: 'Consulta reservas activas o el historial por rango de fechas cuando lo necesites.',
  },
];

const FLOWS = [
  {
    id: 'nueva',
    title: 'Nueva reserva',
    description:
      'Formulario guiado con validación en servidor. Sin adivinar si hay cupo: el sistema responde claro.',
    cta: 'Abrir formulario',
    accent: 'orange',
  },
  {
    id: 'activas',
    title: 'Reservas activas',
    description:
      'Listado de solicitudes vigentes: fechas futuras o el mismo día si el horario aún no pasó.',
    cta: 'Ver listado',
    accent: 'rose',
  },
  {
    id: 'pasadas',
    title: 'Historial',
    description:
      'Filtra por fechas para revisar reservas anteriores, sin mezclarlas con lo actual.',
    cta: 'Consultar',
    accent: 'blend',
  },
];

export default function LandingPage({ onEnter }) {
  const scrollToId = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const marquee = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className="landing-shell">
      <header className="landing-nav" role="banner">
        <div className="landing-nav-inner">
          <span className="landing-logo" aria-hidden>
            LAB
            <span className="landing-logo-accent">ACCESS</span>
          </span>
          <nav className="landing-nav-links" aria-label="Secciones">
            <button type="button" className="landing-nav-link" onClick={() => scrollToId('como-funciona')}>
              Cómo funciona
            </button>
            <button type="button" className="landing-nav-link" onClick={() => scrollToId('stack')}>
              Stack
            </button>
            <button type="button" className="landing-nav-link" onClick={() => scrollToId('acceso')}>
              Acceso
            </button>
          </nav>
          <button type="button" className="landing-nav-cta" onClick={() => onEnter('nueva')}>
            Reservar
          </button>
        </div>
      </header>

      <section className="landing-hero-replica" aria-labelledby="hero-title">
        <p className="landing-badge">
          <span className="landing-badge-dot" aria-hidden />
          Arquitectura serverless · React + AWS
        </p>
        <h1 id="hero-title" className="landing-hero-h1">
          El sistema de{' '}
          <em className="landing-hero-em">reservas</em>
          <br />
          para laboratorios universitarios
        </h1>
        <p className="landing-hero-sub">
          Centraliza solicitudes de acceso, aplica reglas de negocio en la nube y ofrece una experiencia
          clara para estudiantes y administración.
        </p>
        <div className="landing-hero-actions">
          <button type="button" className="btn btn-landing" onClick={() => onEnter('nueva')}>
            Comenzar
          </button>
          <button type="button" className="btn btn-landing-ghost" onClick={() => scrollToId('como-funciona')}>
            Cómo funciona
          </button>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {marquee.map((item, i) => (
            <div key={`${item.cmd}-${i}`} className="marquee-card">
              <div className="marquee-card-head">
                <span className="marquee-card-title">{item.cmd}</span>
              </div>
              <code className="marquee-cmd">$ lab {item.cmd}</code>
              <div className="marquee-meta">
                <span className="marquee-branch">{item.branch}</span>
                <span className="marquee-diff">
                  <span className="marquee-plus">+{item.plus}</span>{' '}
                  <span className="marquee-minus">−{item.minus}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="landing-section" id="como-funciona" aria-labelledby="how-heading">
        <p className="landing-section-kicker">01 · Cómo funciona</p>
        <h2 id="how-heading" className="landing-section-h2">
          De la solicitud a la confirmación
        </h2>
        <p className="landing-section-lead">
          Tres pasos alineados con el flujo real de la práctica: interfaz, reglas en Lambda y consultas.
        </p>
        <ol className="how-steps">
          {STEPS.map((s) => (
            <li key={s.n} className="how-step">
              <span className="how-step-num">{s.n}</span>
              <div className="how-step-body">
                <h3 className="how-step-title">{s.title}</h3>
                <p className="how-step-text">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-section landing-section--stack" id="stack" aria-labelledby="stack-heading">
        <p className="landing-section-kicker">02 · Stack</p>
        <h2 id="stack-heading" className="landing-section-h2">
          Herramientas con las que está construido
        </h2>
        <p className="landing-section-lead">
          Misma línea que productos SaaS modernos: frontend rápido, API gestionada y datos sin servidor
          dedicado.
        </p>
        <div className="tech-slider-wrap tech-slider-wrap--inset">
          <div className="tech-slider-fade tech-slider-fade--left" aria-hidden />
          <div className="tech-slider-fade tech-slider-fade--right" aria-hidden />
          <div className="tech-slider" role="region" aria-label="Tecnologías del proyecto" tabIndex={0}>
            <div className="tech-slider-track">
              {TOOLS.map((t) => (
                <article key={t.name} className="tech-card tech-card--replica">
                  <h3 className="tech-card-name">{t.name}</h3>
                  <p className="tech-card-role">{t.role}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section" id="acceso" aria-labelledby="acceso-heading">
        <p className="landing-section-kicker">03 · Acceso</p>
        <h2 id="acceso-heading" className="landing-section-h2">
          Elige qué necesitas
        </h2>
        <p className="landing-section-lead">
          Tres entradas independientes: crear, revisar vigentes o analizar el pasado.
        </p>
        <div className="flow-grid flow-grid--replica">
          {FLOWS.map((flow) => (
            <article key={flow.id} className={`flow-card flow-card--${flow.accent}`}>
              <h3 className="flow-card-title">{flow.title}</h3>
              <p className="flow-card-desc">{flow.description}</p>
              <button type="button" className="flow-card-btn" onClick={() => onEnter(flow.id)}>
                {flow.cta}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-cta-replica" aria-labelledby="cta-final">
        <h2 id="cta-final" className="landing-cta-replica-title">
          ¿Listo para solicitar acceso?
        </h2>
        <p className="landing-cta-replica-sub">Un clic y pasas al formulario de reserva.</p>
        <button type="button" className="btn btn-landing btn-landing-lg" onClick={() => onEnter('nueva')}>
          Reservar ahora
        </button>
      </section>

      <footer className="landing-footer-replica">
        <p>Gestión de laboratorios · Práctica serverless</p>
      </footer>
    </div>
  );
}
