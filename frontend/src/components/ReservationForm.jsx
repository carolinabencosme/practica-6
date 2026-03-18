import { useState } from 'react';
import { crearReserva } from '../services/api';

const LABS = ['Lab 1', 'Lab 2', 'Lab 3', 'Lab 4'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 8..22

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function ReservationForm() {
  const [form, setForm] = useState({
    correo: '',
    nombre: '',
    id: '',
    fecha: today(),
    hora: 8,
    laboratorio: LABS[0],
  });
  const [status, setStatus] = useState(null); // null | { type: 'success'|'error', message: string, errors?: object }
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'hora' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const result = await crearReserva(form);
      if (result.success) {
        setStatus({ type: 'success', message: result.message });
        setForm({ correo: '', nombre: '', id: '', fecha: today(), hora: 8, laboratorio: LABS[0] });
      } else {
        setStatus({ type: 'error', message: result.message, errors: result.errors });
      }
    } catch {
      setStatus({ type: 'error', message: 'Error de conexión. Verifica la URL de la API.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Nueva Reserva</h2>
      {status && (
        <div className={`alert alert-${status.type}`}>
          <p>{status.message}</p>
          {status.errors && (
            <ul>
              {Object.entries(status.errors).map(([field, msg]) => (
                <li key={field}>{msg}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="correo">Correo electrónico *</label>
          <input
            id="correo"
            name="correo"
            type="email"
            value={form.correo}
            onChange={handleChange}
            placeholder="estudiante@universidad.edu"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="nombre">Nombre completo *</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            placeholder="María López García"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="id">ID de estudiante *</label>
          <input
            id="id"
            name="id"
            type="text"
            value={form.id}
            onChange={handleChange}
            placeholder="A00123456"
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fecha">Fecha *</label>
            <input
              id="fecha"
              name="fecha"
              type="date"
              value={form.fecha}
              min={today()}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="hora">Hora *</label>
            <select id="hora" name="hora" value={form.hora} onChange={handleChange} required>
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="laboratorio">Laboratorio *</label>
          <select
            id="laboratorio"
            name="laboratorio"
            value={form.laboratorio}
            onChange={handleChange}
            required
          >
            {LABS.map((lab) => (
              <option key={lab} value={lab}>
                {lab}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Reservando…' : 'Crear Reserva'}
        </button>
      </form>
    </div>
  );
}
