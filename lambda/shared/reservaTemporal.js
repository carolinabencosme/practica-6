'use strict';

function getUniversityNow() {
  const tzOffset = parseInt(process.env.TABLE_TZ_OFFSET || '0', 10);
  const now = new Date(Date.now() + tzOffset * 3600000);

  return {
    now,
    todayStr: now.toISOString().slice(0, 10),
    currentHour: now.getUTCHours(),
  };
}

function isReservaPast(reserva, reference = getUniversityNow()) {
  if (!reserva || !reserva.fecha) {
    return false;
  }

  if (reserva.fecha < reference.todayStr) {
    return true;
  }

  if (reserva.fecha > reference.todayStr) {
    return false;
  }

  return Number(reserva.hora) + 1 <= reference.currentHour;
}

function isReservaActive(reserva, reference = getUniversityNow()) {
  return !isReservaPast(reserva, reference);
}

module.exports = {
  getUniversityNow,
  isReservaPast,
  isReservaActive,
};
