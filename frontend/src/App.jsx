import { useState } from 'react';
import ReservationForm from './components/ReservationForm';
import ActiveReservations from './components/ActiveReservations';
import PastReservations from './components/PastReservations';
import './App.css';

const TABS = [
  { id: 'nueva', label: '➕ Nueva Reserva', Component: ReservationForm },
  { id: 'activas', label: '✅ Reservas Activas', Component: ActiveReservations },
  { id: 'pasadas', label: '🗓️ Reservas Pasadas', Component: PastReservations },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('nueva');
  const { Component } = TABS.find((t) => t.id === activeTab);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔬 Gestión de Reservas de Laboratorio</h1>
        <p className="app-subtitle">Sistema de acceso a laboratorios universitarios</p>
      </header>

      <nav className="tab-nav">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            className={`tab-btn${activeTab === id ? ' active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        <Component />
      </main>

      <footer className="app-footer">
        <p>Práctica 6 – Aplicación Serverless · AWS Lambda + DynamoDB + React</p>
      </footer>
    </div>
  );
}
