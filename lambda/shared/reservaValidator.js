'use strict';

/**
 * Validates reservation input data.
 *
 * @param {Object} data
 * @param {string} data.correo       - Email address
 * @param {string} data.nombre       - Full name
 * @param {string} data.id           - Student/user ID
 * @param {string} data.fecha        - Date (YYYY-MM-DD)
 * @param {number|string} data.hora  - Hour (integer 8–22)
 * @param {string} data.laboratorio  - Laboratory name
 * @param {boolean} [skipPastDateCheck] - Skip the "no past dates" check (for listing only)
 * @returns {{ valid: boolean, errors: Object.<string, string> }}
 */
function validateReserva(data, skipPastDateCheck = false) {
  const errors = {};

  // correo: required, valid email format
  if (!data.correo || data.correo.trim() === '') {
    errors.correo = 'El correo es obligatorio.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo.trim())) {
    errors.correo = 'El correo no tiene un formato válido.';
  }

  // nombre: required, 2–100 characters
  if (!data.nombre || data.nombre.trim() === '') {
    errors.nombre = 'El nombre es obligatorio.';
  } else if (data.nombre.trim().length < 2 || data.nombre.trim().length > 100) {
    errors.nombre = 'El nombre debe tener entre 2 y 100 caracteres.';
  }

  // id: required, non-empty
  if (!data.id || String(data.id).trim() === '') {
    errors.id = 'El ID es obligatorio.';
  }

  // fecha: required, valid YYYY-MM-DD, not in the past (unless skipPastDateCheck)
  if (!data.fecha || data.fecha.trim() === '') {
    errors.fecha = 'La fecha es obligatoria.';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.fecha.trim())) {
    errors.fecha = 'La fecha debe tener el formato YYYY-MM-DD.';
  } else if (!skipPastDateCheck) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reservaDate = new Date(data.fecha.trim() + 'T00:00:00');
    if (reservaDate < today) {
      errors.fecha = 'No se pueden crear reservas para fechas pasadas.';
    }
  }

  // hora: required, integer 8–22 inclusive
  const hora = Number(data.hora);
  if (data.hora === undefined || data.hora === null || data.hora === '') {
    errors.hora = 'La hora es obligatoria.';
  } else if (!Number.isInteger(hora) || isNaN(hora)) {
    errors.hora = 'La hora debe ser un número entero.';
  } else if (hora < 8 || hora > 22) {
    errors.hora = 'La hora debe estar entre 8 y 22 (inclusive).';
  }

  // laboratorio: required, non-empty
  if (!data.laboratorio || data.laboratorio.trim() === '') {
    errors.laboratorio = 'El laboratorio es obligatorio.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

module.exports = { validateReserva };
