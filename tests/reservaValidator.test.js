'use strict';

const { validateReserva } = require('../lambda/shared/reservaValidator');

// ---------------------------------------------------------------------------
// Helper: valid base reservation data (future date)
// ---------------------------------------------------------------------------
function validReserva(overrides = {}) {
  // Use a date far in the future to avoid flaky past-date failures
  return {
    correo: 'estudiante@universidad.edu',
    nombre: 'María López',
    id: 'A00123456',
    fecha: '2099-06-15',
    hora: 10,
    laboratorio: 'Lab 1',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// validateReserva – correo
// ---------------------------------------------------------------------------
describe('validateReserva – correo', () => {
  test('acepta correo válido', () => {
    expect(validateReserva(validReserva()).valid).toBe(true);
  });

  test('error cuando correo está vacío', () => {
    const { valid, errors } = validateReserva(validReserva({ correo: '' }));
    expect(valid).toBe(false);
    expect(errors.correo).toBeDefined();
  });

  test('error cuando correo no tiene @', () => {
    const { valid, errors } = validateReserva(validReserva({ correo: 'sinArrobaDominio.com' }));
    expect(valid).toBe(false);
    expect(errors.correo).toBeDefined();
  });

  test('error cuando correo no tiene dominio', () => {
    const { valid, errors } = validateReserva(validReserva({ correo: 'user@' }));
    expect(valid).toBe(false);
    expect(errors.correo).toBeDefined();
  });

  test('error cuando correo no tiene TLD', () => {
    const { valid, errors } = validateReserva(validReserva({ correo: 'user@dominio' }));
    expect(valid).toBe(false);
    expect(errors.correo).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// validateReserva – nombre
// ---------------------------------------------------------------------------
describe('validateReserva – nombre', () => {
  test('acepta nombre válido', () => {
    expect(validateReserva(validReserva()).valid).toBe(true);
  });

  test('error cuando nombre está vacío', () => {
    const { valid, errors } = validateReserva(validReserva({ nombre: '' }));
    expect(valid).toBe(false);
    expect(errors.nombre).toBeDefined();
  });

  test('error cuando nombre tiene solo espacios', () => {
    const { valid, errors } = validateReserva(validReserva({ nombre: '   ' }));
    expect(valid).toBe(false);
    expect(errors.nombre).toBeDefined();
  });

  test('error cuando nombre tiene menos de 2 caracteres', () => {
    const { valid, errors } = validateReserva(validReserva({ nombre: 'A' }));
    expect(valid).toBe(false);
    expect(errors.nombre).toBeDefined();
  });

  test('error cuando nombre tiene más de 100 caracteres', () => {
    const { valid, errors } = validateReserva(validReserva({ nombre: 'A'.repeat(101) }));
    expect(valid).toBe(false);
    expect(errors.nombre).toBeDefined();
  });

  test('acepta nombre de exactamente 2 caracteres', () => {
    const { valid } = validateReserva(validReserva({ nombre: 'AB' }));
    expect(valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateReserva – id
// ---------------------------------------------------------------------------
describe('validateReserva – id', () => {
  test('acepta id válido', () => {
    expect(validateReserva(validReserva()).valid).toBe(true);
  });

  test('error cuando id está vacío', () => {
    const { valid, errors } = validateReserva(validReserva({ id: '' }));
    expect(valid).toBe(false);
    expect(errors.id).toBeDefined();
  });

  test('error cuando id es undefined', () => {
    const data = validReserva();
    delete data.id;
    const { valid, errors } = validateReserva(data);
    expect(valid).toBe(false);
    expect(errors.id).toBeDefined();
  });

  test('acepta id numérico como string', () => {
    const { valid } = validateReserva(validReserva({ id: '12345678' }));
    expect(valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateReserva – fecha
// ---------------------------------------------------------------------------
describe('validateReserva – fecha', () => {
  test('acepta fecha futura válida', () => {
    expect(validateReserva(validReserva()).valid).toBe(true);
  });

  test('error cuando fecha está vacía', () => {
    const { valid, errors } = validateReserva(validReserva({ fecha: '' }));
    expect(valid).toBe(false);
    expect(errors.fecha).toBeDefined();
  });

  test('error cuando fecha tiene formato incorrecto (DD/MM/YYYY)', () => {
    const { valid, errors } = validateReserva(validReserva({ fecha: '15/06/2099' }));
    expect(valid).toBe(false);
    expect(errors.fecha).toBeDefined();
  });

  test('error cuando fecha tiene formato incorrecto (texto)', () => {
    const { valid, errors } = validateReserva(validReserva({ fecha: 'manana' }));
    expect(valid).toBe(false);
    expect(errors.fecha).toBeDefined();
  });

  test('error cuando fecha es pasada', () => {
    const { valid, errors } = validateReserva(validReserva({ fecha: '2000-01-01' }));
    expect(valid).toBe(false);
    expect(errors.fecha).toBeDefined();
  });

  test('skipPastDateCheck permite fechas pasadas', () => {
    const { valid } = validateReserva(validReserva({ fecha: '2000-01-01' }), true);
    expect(valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateReserva – hora
// ---------------------------------------------------------------------------
describe('validateReserva – hora', () => {
  test('acepta hora válida (8)', () => {
    expect(validateReserva(validReserva({ hora: 8 })).valid).toBe(true);
  });

  test('acepta hora válida (22)', () => {
    expect(validateReserva(validReserva({ hora: 22 })).valid).toBe(true);
  });

  test('acepta hora válida (15)', () => {
    expect(validateReserva(validReserva({ hora: 15 })).valid).toBe(true);
  });

  test('error cuando hora está vacía', () => {
    const { valid, errors } = validateReserva(validReserva({ hora: '' }));
    expect(valid).toBe(false);
    expect(errors.hora).toBeDefined();
  });

  test('error cuando hora es undefined', () => {
    const data = validReserva();
    delete data.hora;
    const { valid, errors } = validateReserva(data);
    expect(valid).toBe(false);
    expect(errors.hora).toBeDefined();
  });

  test('error cuando hora es 7 (menor al mínimo)', () => {
    const { valid, errors } = validateReserva(validReserva({ hora: 7 }));
    expect(valid).toBe(false);
    expect(errors.hora).toBeDefined();
  });

  test('error cuando hora es 23 (mayor al máximo)', () => {
    const { valid, errors } = validateReserva(validReserva({ hora: 23 }));
    expect(valid).toBe(false);
    expect(errors.hora).toBeDefined();
  });

  test('error cuando hora es 0', () => {
    const { valid, errors } = validateReserva(validReserva({ hora: 0 }));
    expect(valid).toBe(false);
    expect(errors.hora).toBeDefined();
  });

  test('error cuando hora es negativa', () => {
    const { valid, errors } = validateReserva(validReserva({ hora: -1 }));
    expect(valid).toBe(false);
    expect(errors.hora).toBeDefined();
  });

  test('error cuando hora es decimal (8.5)', () => {
    const { valid, errors } = validateReserva(validReserva({ hora: 8.5 }));
    expect(valid).toBe(false);
    expect(errors.hora).toBeDefined();
  });

  test('error cuando hora es texto no numérico', () => {
    const { valid, errors } = validateReserva(validReserva({ hora: 'manana' }));
    expect(valid).toBe(false);
    expect(errors.hora).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// validateReserva – laboratorio
// ---------------------------------------------------------------------------
describe('validateReserva – laboratorio', () => {
  test('acepta laboratorio válido', () => {
    expect(validateReserva(validReserva()).valid).toBe(true);
  });

  test('error cuando laboratorio está vacío', () => {
    const { valid, errors } = validateReserva(validReserva({ laboratorio: '' }));
    expect(valid).toBe(false);
    expect(errors.laboratorio).toBeDefined();
  });

  test('error cuando laboratorio es undefined', () => {
    const data = validReserva();
    delete data.laboratorio;
    const { valid, errors } = validateReserva(data);
    expect(valid).toBe(false);
    expect(errors.laboratorio).toBeDefined();
  });

  test('acepta laboratorio con nombre largo', () => {
    const { valid } = validateReserva(validReserva({ laboratorio: 'Laboratorio de Química 3' }));
    expect(valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateReserva – múltiples errores
// ---------------------------------------------------------------------------
describe('validateReserva – múltiples errores', () => {
  test('retorna todos los errores cuando los datos están vacíos', () => {
    const { valid, errors } = validateReserva({});
    expect(valid).toBe(false);
    expect(errors.correo).toBeDefined();
    expect(errors.nombre).toBeDefined();
    expect(errors.id).toBeDefined();
    expect(errors.fecha).toBeDefined();
    expect(errors.hora).toBeDefined();
    expect(errors.laboratorio).toBeDefined();
  });

  test('retorna solo los errores de los campos inválidos', () => {
    const { valid, errors } = validateReserva(validReserva({ correo: 'malformado', hora: 25 }));
    expect(valid).toBe(false);
    expect(errors.correo).toBeDefined();
    expect(errors.hora).toBeDefined();
    expect(errors.nombre).toBeUndefined();
    expect(errors.id).toBeUndefined();
    expect(errors.laboratorio).toBeUndefined();
  });
});
