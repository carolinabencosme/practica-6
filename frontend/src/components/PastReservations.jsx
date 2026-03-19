import { useMemo, useState } from 'react';
import { listarPorRango } from '../services/api';
import { getLocalDateMonthsAgo, getLocalToday } from '../utils/dateUtils';

function formatHora(hora) {
  return `${String(hora).padStart(2, '0')}:00 – ${String(hora + 1).padStart(2, '0')}:00`;
}


export default function PastReservations() {
  const maxFechaHasta = useMemo(() => getLocalToday(), []);
  const [fechaDesde, setFechaDesde] = useState(getLocalDateMonthsAgo(1));
  const [fechaHasta, setFechaHasta] = useState(maxFechaHasta);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(false);
    try {
      const result = await listarPorRango(fechaDesde, fechaHasta);
      if (result.success) {
        setReservas(result.reservas || []);
        setSearched(true);
      } else {
        setError(result.message || 'Error al consultar las reservas.');
      }
    } catch {
      setError('Error de conexión. Verifica la URL de la API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Historial de Reservas</h2>
      <p className="helper-text">
        Consulta únicamente reservas pasadas: fechas anteriores a hoy o reservas de hoy cuyo horario ya terminó.
      </p>
      <form onSubmit={handleSearch} className="range-form">
        <div className="form-group">
          <label htmlFor="fechaDesde">Fecha desde *</label>
          <input
            id="fechaDesde"
            type="date"
            value={fechaDesde}
            max={fechaHasta}
            onChange={(e) => setFechaDesde(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="fechaHasta">Fecha hasta *</label>
          <input
            id="fechaHasta"
            type="date"
            value={fechaHasta}
            min={fechaDesde}
            max={maxFechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Buscando…' : 'Buscar historial'}
        </button>
      </form>

      {error && <div className="alert alert-error"><p>{error}</p></div>}

      {searched && !error && reservas.length === 0 && (
        <p className="empty-state">No se encontraron reservas pasadas en ese rango de fechas.</p>
      )}

      {reservas.length > 0 && (
        <div className="table-wrapper">
          <p className="result-count">{reservas.length} reserva(s) pasada(s) encontrada(s)</p>
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
