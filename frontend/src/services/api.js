import API_BASE_URL from '../config';

/**
 * Creates a new lab reservation.
 * @param {{ correo: string, nombre: string, id: string, fecha: string, hora: number, laboratorio: string }} data
 * @returns {Promise<{ success: boolean, message: string, reserva?: object, errors?: object }>}
 */
export async function crearReserva(data) {
  const res = await fetch(`${API_BASE_URL}/reservas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

/**
 * Lists all currently active reservations (not yet expired).
 * @returns {Promise<{ success: boolean, reservas: object[] }>}
 */
export async function listarActivas() {
  const res = await fetch(`${API_BASE_URL}/reservas/activas`);
  return res.json();
}

/**
 * Lists reservations within a date range.
 * @param {string} fechaDesde - Start date YYYY-MM-DD
 * @param {string} fechaHasta - End date YYYY-MM-DD
 * @returns {Promise<{ success: boolean, reservas: object[] }>}
 */
export async function listarPorRango(fechaDesde, fechaHasta) {
  const params = new URLSearchParams({ fechaDesde, fechaHasta });
  const res = await fetch(`${API_BASE_URL}/reservas/rango?${params}`);
  return res.json();
}
