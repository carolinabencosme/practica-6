'use strict';

const { isReservaPast, isReservaActive } = require('../lambda/shared/reservaTemporal');

describe('reservaTemporal', () => {
  const reference = {
    todayStr: '2026-03-19',
    currentHour: 15,
  };

  test('marca como pasada una reserva de fecha anterior', () => {
    expect(isReservaPast({ fecha: '2026-03-18', hora: 22 }, reference)).toBe(true);
  });

  test('marca como pasada una reserva de hoy cuyo slot ya terminó', () => {
    expect(isReservaPast({ fecha: '2026-03-19', hora: 14 }, reference)).toBe(true);
  });

  test('mantiene activa una reserva de hoy mientras su slot no termina', () => {
    expect(isReservaPast({ fecha: '2026-03-19', hora: 15 }, reference)).toBe(false);
    expect(isReservaActive({ fecha: '2026-03-19', hora: 15 }, reference)).toBe(true);
  });

  test('mantiene activa una reserva futura', () => {
    expect(isReservaPast({ fecha: '2026-03-20', hora: 8 }, reference)).toBe(false);
  });
});
