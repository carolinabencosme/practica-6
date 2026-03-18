'use strict';

const { validateRegistration } = require('../src/validator');
const { registerUser, getRegisteredUsers, clearUsers } = require('../src/registration');

// ---------------------------------------------------------------------------
// Helper: valid base data
// ---------------------------------------------------------------------------
function validData(overrides = {}) {
  return {
    nombre: 'Ana García',
    username: 'ana_garcia',
    email: 'ana@ejemplo.com',
    password: 'Segura@123',
    confirmPassword: 'Segura@123',
    edad: 25,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// validateRegistration – NOMBRE
// ---------------------------------------------------------------------------
describe('validateRegistration – nombre', () => {
  test('acepta nombre válido', () => {
    expect(validateRegistration(validData()).valid).toBe(true);
  });

  test('error cuando nombre está vacío', () => {
    const { valid, errors } = validateRegistration(validData({ nombre: '' }));
    expect(valid).toBe(false);
    expect(errors.nombre).toBeDefined();
  });

  test('error cuando nombre es solo espacios', () => {
    const { valid, errors } = validateRegistration(validData({ nombre: '   ' }));
    expect(valid).toBe(false);
    expect(errors.nombre).toBeDefined();
  });

  test('error cuando nombre tiene menos de 2 caracteres', () => {
    const { valid, errors } = validateRegistration(validData({ nombre: 'A' }));
    expect(valid).toBe(false);
    expect(errors.nombre).toBeDefined();
  });

  test('error cuando nombre tiene más de 50 caracteres', () => {
    const { valid, errors } = validateRegistration(validData({ nombre: 'A'.repeat(51) }));
    expect(valid).toBe(false);
    expect(errors.nombre).toBeDefined();
  });

  test('error cuando nombre contiene números', () => {
    const { valid, errors } = validateRegistration(validData({ nombre: 'Ana123' }));
    expect(valid).toBe(false);
    expect(errors.nombre).toBeDefined();
  });

  test('acepta nombre con caracteres acentuados y ñ', () => {
    const { valid } = validateRegistration(validData({ nombre: 'José Muñoz' }));
    expect(valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateRegistration – USERNAME
// ---------------------------------------------------------------------------
describe('validateRegistration – username', () => {
  test('acepta username válido', () => {
    expect(validateRegistration(validData()).valid).toBe(true);
  });

  test('error cuando username está vacío', () => {
    const { valid, errors } = validateRegistration(validData({ username: '' }));
    expect(valid).toBe(false);
    expect(errors.username).toBeDefined();
  });

  test('error cuando username tiene menos de 3 caracteres', () => {
    const { valid, errors } = validateRegistration(validData({ username: 'ab' }));
    expect(valid).toBe(false);
    expect(errors.username).toBeDefined();
  });

  test('error cuando username tiene más de 20 caracteres', () => {
    const { valid, errors } = validateRegistration(validData({ username: 'a'.repeat(21) }));
    expect(valid).toBe(false);
    expect(errors.username).toBeDefined();
  });

  test('error cuando username tiene caracteres especiales no permitidos', () => {
    const { valid, errors } = validateRegistration(validData({ username: 'user@name' }));
    expect(valid).toBe(false);
    expect(errors.username).toBeDefined();
  });

  test('acepta username con letras, números y guión bajo', () => {
    const { valid } = validateRegistration(validData({ username: 'user_123' }));
    expect(valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateRegistration – EMAIL
// ---------------------------------------------------------------------------
describe('validateRegistration – email', () => {
  test('acepta email válido', () => {
    expect(validateRegistration(validData()).valid).toBe(true);
  });

  test('error cuando email está vacío', () => {
    const { valid, errors } = validateRegistration(validData({ email: '' }));
    expect(valid).toBe(false);
    expect(errors.email).toBeDefined();
  });

  test('error cuando email no tiene @', () => {
    const { valid, errors } = validateRegistration(validData({ email: 'sinArroba.com' }));
    expect(valid).toBe(false);
    expect(errors.email).toBeDefined();
  });

  test('error cuando email no tiene dominio', () => {
    const { valid, errors } = validateRegistration(validData({ email: 'user@' }));
    expect(valid).toBe(false);
    expect(errors.email).toBeDefined();
  });

  test('error cuando email no tiene TLD', () => {
    const { valid, errors } = validateRegistration(validData({ email: 'user@dominio' }));
    expect(valid).toBe(false);
    expect(errors.email).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// validateRegistration – PASSWORD
// ---------------------------------------------------------------------------
describe('validateRegistration – password', () => {
  test('acepta contraseña válida', () => {
    expect(validateRegistration(validData()).valid).toBe(true);
  });

  test('error cuando contraseña está vacía', () => {
    const { valid, errors } = validateRegistration(
      validData({ password: '', confirmPassword: '' })
    );
    expect(valid).toBe(false);
    expect(errors.password).toBeDefined();
  });

  test('error cuando contraseña tiene menos de 8 caracteres', () => {
    const { valid, errors } = validateRegistration(
      validData({ password: 'Ab1@x', confirmPassword: 'Ab1@x' })
    );
    expect(valid).toBe(false);
    expect(errors.password).toBeDefined();
  });

  test('error cuando contraseña no tiene mayúscula', () => {
    const { valid, errors } = validateRegistration(
      validData({ password: 'sinmayus@1', confirmPassword: 'sinmayus@1' })
    );
    expect(valid).toBe(false);
    expect(errors.password).toBeDefined();
  });

  test('error cuando contraseña no tiene minúscula', () => {
    const { valid, errors } = validateRegistration(
      validData({ password: 'SINMINUSC@1', confirmPassword: 'SINMINUSC@1' })
    );
    expect(valid).toBe(false);
    expect(errors.password).toBeDefined();
  });

  test('error cuando contraseña no tiene número', () => {
    const { valid, errors } = validateRegistration(
      validData({ password: 'SinNumero@', confirmPassword: 'SinNumero@' })
    );
    expect(valid).toBe(false);
    expect(errors.password).toBeDefined();
  });

  test('error cuando contraseña no tiene carácter especial', () => {
    const { valid, errors } = validateRegistration(
      validData({ password: 'SinEspecial1', confirmPassword: 'SinEspecial1' })
    );
    expect(valid).toBe(false);
    expect(errors.password).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// validateRegistration – CONFIRM PASSWORD
// ---------------------------------------------------------------------------
describe('validateRegistration – confirmPassword', () => {
  test('error cuando confirmación está vacía', () => {
    const { valid, errors } = validateRegistration(validData({ confirmPassword: '' }));
    expect(valid).toBe(false);
    expect(errors.confirmPassword).toBeDefined();
  });

  test('error cuando contraseñas no coinciden', () => {
    const { valid, errors } = validateRegistration(
      validData({ confirmPassword: 'Diferente@1' })
    );
    expect(valid).toBe(false);
    expect(errors.confirmPassword).toBeDefined();
  });

  test('sin error cuando contraseñas coinciden', () => {
    const { valid } = validateRegistration(validData());
    expect(valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateRegistration – EDAD
// ---------------------------------------------------------------------------
describe('validateRegistration – edad', () => {
  test('acepta edad válida (18)', () => {
    expect(validateRegistration(validData({ edad: 18 })).valid).toBe(true);
  });

  test('acepta edad válida (30)', () => {
    expect(validateRegistration(validData({ edad: 30 })).valid).toBe(true);
  });

  test('error cuando edad está vacía', () => {
    const { valid, errors } = validateRegistration(validData({ edad: '' }));
    expect(valid).toBe(false);
    expect(errors.edad).toBeDefined();
  });

  test('error cuando edad es undefined', () => {
    const data = validData();
    delete data.edad;
    const { valid, errors } = validateRegistration(data);
    expect(valid).toBe(false);
    expect(errors.edad).toBeDefined();
  });

  test('error cuando edad es menor de 18', () => {
    const { valid, errors } = validateRegistration(validData({ edad: 17 }));
    expect(valid).toBe(false);
    expect(errors.edad).toBeDefined();
  });

  test('error cuando edad es 0', () => {
    const { valid, errors } = validateRegistration(validData({ edad: 0 }));
    expect(valid).toBe(false);
    expect(errors.edad).toBeDefined();
  });

  test('error cuando edad es negativa', () => {
    const { valid, errors } = validateRegistration(validData({ edad: -5 }));
    expect(valid).toBe(false);
    expect(errors.edad).toBeDefined();
  });

  test('error cuando edad es mayor de 120', () => {
    const { valid, errors } = validateRegistration(validData({ edad: 121 }));
    expect(valid).toBe(false);
    expect(errors.edad).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// validateRegistration – múltiples errores
// ---------------------------------------------------------------------------
describe('validateRegistration – múltiples errores', () => {
  test('retorna todos los errores cuando todo está vacío', () => {
    const { valid, errors } = validateRegistration({});
    expect(valid).toBe(false);
    expect(errors.nombre).toBeDefined();
    expect(errors.username).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
    expect(errors.confirmPassword).toBeDefined();
    expect(errors.edad).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// registerUser
// ---------------------------------------------------------------------------
describe('registerUser', () => {
  beforeEach(() => {
    clearUsers();
  });

  test('registra usuario válido correctamente', () => {
    const result = registerUser(validData());
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.username).toBe('ana_garcia');
    expect(result.user.email).toBe('ana@ejemplo.com');
  });

  test('no almacena la contraseña en el objeto de usuario', () => {
    const result = registerUser(validData());
    expect(result.user.password).toBeUndefined();
  });

  test('falla con datos inválidos', () => {
    const result = registerUser({ nombre: '', username: '', email: 'mal', password: '123', confirmPassword: '', edad: 10 });
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  test('falla cuando username ya está en uso', () => {
    registerUser(validData());
    const result = registerUser(validData({ email: 'otro@ejemplo.com' }));
    expect(result.success).toBe(false);
    expect(result.errors.username).toBeDefined();
  });

  test('falla cuando email ya está registrado', () => {
    registerUser(validData());
    const result = registerUser(validData({ username: 'otro_user' }));
    expect(result.success).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  test('permite registrar múltiples usuarios únicos', () => {
    registerUser(validData());
    const result = registerUser(
      validData({ username: 'otro_user', email: 'otro@ejemplo.com' })
    );
    expect(result.success).toBe(true);
    expect(getRegisteredUsers()).toHaveLength(2);
  });
});
