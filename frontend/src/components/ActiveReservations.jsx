import { useState, useEffect } from 'react';
import { listarActivas } from '../services/api';

function formatHora(hora) {
  return `${String(hora).padStart(2, '0')}:00 – ${String(hora + 1).padStart(2, '0')}:00`;
}

export default function ActiveReservations() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listarActivas();
      if (result.success) {
        setReservas(result.reservas || []);
      } else {
        setError(result.message || 'Error al cargar las reservas activas.');
      }
    } catch {
      setError('Error de conexión. Verifica la URL de la API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h2>Reservas Activas</h2>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
          {loading ? 'Cargando…' : 'Actualizar'}
        </button>
      </div>

      {error && <div className="alert alert-error"><p>{error}</p></div>}

      {!loading && !error && reservas.length === 0 && (
        <p className="empty-state">No hay reservas activas en este momento.</p>
      )}

      {reservas.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Horario</th>
                <th>Laboratorio</th>
                <th>Nombre</th>
                <th>ID</th>
                <th>Correo</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((r) => (
                <tr key={r.idReserva}>
                  <td>{r.fecha}</td>
                  <td>{formatHora(r.hora)}</td>
                  <td>{r.laboratorio}</td>
                  <td>{r.nombre}</td>
                  <td>{r.estudianteId}</td>
                  <td>{r.correo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
