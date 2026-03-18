'use strict';

const { validateRegistration } = require('./validator');

// In-memory store for registered users (for demonstration purposes)
const registeredUsers = [];

/**
 * Attempts to register a new user after validating the provided data.
 *
 * @param {Object} data - Registration form data
 * @returns {{ success: boolean, message: string, errors?: Object, user?: Object }}
 */
function registerUser(data) {
  const { valid, errors } = validateRegistration(data);

  if (!valid) {
    return {
      success: false,
      message: 'El formulario contiene errores. Por favor, corrígelos.',
      errors,
    };
  }

  // Check for duplicate username
  if (registeredUsers.some((u) => u.username === data.username.trim())) {
    return {
      success: false,
      message: 'El nombre de usuario ya está en uso.',
      errors: { username: 'El nombre de usuario ya está en uso.' },
    };
  }

  // Check for duplicate email
  if (registeredUsers.some((u) => u.email === data.email.trim().toLowerCase())) {
    return {
      success: false,
      message: 'El correo electrónico ya está registrado.',
      errors: { email: 'El correo electrónico ya está registrado.' },
    };
  }

  const newUser = {
    id: registeredUsers.length + 1,
    nombre: data.nombre.trim(),
    username: data.username.trim(),
    email: data.email.trim().toLowerCase(),
    edad: Number(data.edad),
    createdAt: new Date().toISOString(),
  };

  registeredUsers.push(newUser);

  return {
    success: true,
    message: '¡Usuario registrado exitosamente!',
    user: newUser,
  };
}

/**
 * Returns a copy of the registered users list (passwords are never stored).
 * @returns {Object[]}
 */
function getRegisteredUsers() {
  return [...registeredUsers];
}

/**
 * Clears all registered users (useful for testing).
 */
function clearUsers() {
  registeredUsers.length = 0;
}

module.exports = { registerUser, getRegisteredUsers, clearUsers };
