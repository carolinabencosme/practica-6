'use strict';

/**
 * Validates a user registration form object.
 *
 * @param {Object} data - The registration data to validate.
 * @param {string} data.nombre          - Full name
 * @param {string} data.username        - Username (alphanumeric, 3-20 chars)
 * @param {string} data.email           - Email address
 * @param {string} data.password        - Password
 * @param {string} data.confirmPassword - Password confirmation
 * @param {number|string} data.edad     - Age (must be >= 18)
 * @returns {{ valid: boolean, errors: Object.<string, string> }}
 */
function validateRegistration(data) {
  const errors = {};

  // Nombre (full name): required, letters and spaces only, 2-50 characters
  if (!data.nombre || data.nombre.trim() === '') {
    errors.nombre = 'El nombre es obligatorio.';
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]{2,50}$/.test(data.nombre.trim())) {
    errors.nombre = 'El nombre debe tener entre 2 y 50 caracteres y solo puede contener letras.';
  }

  // Username: required, alphanumeric (and underscore), 3-20 characters
  if (!data.username || data.username.trim() === '') {
    errors.username = 'El nombre de usuario es obligatorio.';
  } else if (!/^\w{3,20}$/.test(data.username.trim())) {
    errors.username = 'El nombre de usuario debe tener entre 3 y 20 caracteres alfanuméricos.';
  }

  // Email: required, valid format
  if (!data.email || data.email.trim() === '') {
    errors.email = 'El correo electrónico es obligatorio.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'El correo electrónico no tiene un formato válido.';
  }

  // Password: required, min 8 chars, must have uppercase, lowercase, digit, and special char
  if (!data.password || data.password === '') {
    errors.password = 'La contraseña es obligatoria.';
  } else if (data.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres.';
  } else if (!/[A-Z]/.test(data.password)) {
    errors.password = 'La contraseña debe contener al menos una letra mayúscula.';
  } else if (!/[a-z]/.test(data.password)) {
    errors.password = 'La contraseña debe contener al menos una letra minúscula.';
  } else if (!/[0-9]/.test(data.password)) {
    errors.password = 'La contraseña debe contener al menos un número.';
  } else if (!/[^A-Za-z0-9]/.test(data.password)) {
    errors.password = 'La contraseña debe contener al menos un carácter especial.';
  }

  // Confirm password: required and must match password
  if (!data.confirmPassword || data.confirmPassword === '') {
    errors.confirmPassword = 'La confirmación de contraseña es obligatoria.';
  } else if (data.password && data.confirmPassword !== data.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden.';
  }

  // Edad (age): required, numeric, must be >= 18
  const edad = Number(data.edad);
  if (data.edad === undefined || data.edad === null || data.edad === '') {
    errors.edad = 'La edad es obligatoria.';
  } else if (!Number.isInteger(edad) || isNaN(edad)) {
    errors.edad = 'La edad debe ser un número entero.';
  } else if (edad < 18) {
    errors.edad = 'Debes tener al menos 18 años para registrarte.';
  } else if (edad > 120) {
    errors.edad = 'Por favor, ingresa una edad válida.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

module.exports = { validateRegistration };
