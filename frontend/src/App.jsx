import { useState } from 'react';
import LandingPage from './components/LandingPage';
import ReservationForm from './components/ReservationForm';
import ActiveReservations from './components/ActiveReservations';
import PastReservations from './components/PastReservations';
import './App.css';

const TABS = [
  {
    id: 'nueva',
    label: 'Nueva reserva',
    hint: 'Formulario y validación de cupos',
    Component: ReservationForm,
  },
  {
    id: 'activas',
    label: 'Reservas activas',
    hint: 'Listado de reservas vigentes',
    Component: ActiveReservations,
  },
  {
    id: 'pasadas',
    label: 'Reservas pasadas',
    hint: 'Historial por rango de fechas',
    Component: PastReservations,
  },
];

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState('nueva');
  const { Component } = TABS.find((t) => t.id === activeTab);

  const enterApp = (tabId = 'nueva') => {
    setActiveTab(tabId);
    setShowLanding(false);
  };

  return (
    <div className={`app${showLanding ? ' app--landing' : ''}`}>
      {showLanding ? (
        <section className="landing" aria-label="Inicio">
          <LandingPage onEnter={enterApp} />
        </section>
      ) : (
        <>
          <header className="app-header">
            <div className="app-header-row">
              <div>
                <h1>Gestión de reservas de laboratorio</h1>
                <p className="app-subtitle">Sistema de acceso a laboratorios universitarios</p>
              </div>
              <button type="button" className="btn-link" onClick={() => setShowLanding(true)}>
                Inicio
              </button>
            </div>
          </header>

          <nav className="tab-nav tab-nav--modern" aria-label="Secciones de la aplicación">
            {TABS.map(({ id, label, hint }) => (
              <button
                key={id}
                type="button"
                className={`tab-btn tab-btn--rich${activeTab === id ? ' active' : ''}`}
                onClick={() => setActiveTab(id)}
                aria-current={activeTab === id ? 'page' : undefined}
              >
                <span className="tab-btn-label">{label}</span>
                <span className="tab-btn-hint">{hint}</span>
              </button>
            ))}
          </nav>

          <main className="app-main">
            <Component />
          </main>
        </>
      )}
    </div>
  );
}
