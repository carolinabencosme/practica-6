'use strict';

const DEFAULT_TIMEZONE_OFFSET = '0';

function getTimezoneOffsetHours() {
  const rawOffset = process.env.TABLE_TZ_OFFSET || DEFAULT_TIMEZONE_OFFSET;
  const offset = Number.parseInt(rawOffset, 10);

  return Number.isNaN(offset) ? 0 : offset;
}

function getNow(timezoneOffsetHours = getTimezoneOffsetHours()) {
  return new Date(Date.now() + timezoneOffsetHours * 60 * 60 * 1000);
}

function formatDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function getDateParts(referenceDate = getNow()) {
  return {
    now: referenceDate,
    todayStr: formatDateKey(referenceDate),
    currentHour: referenceDate.getUTCHours(),
  };
}

function isReservaPast(reserva, reference = getDateParts()) {
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

function isReservaActive(reserva, reference = getDateParts()) {
  return !isReservaPast(reserva, reference);
}

function isPastDate(dateStr, reference = getDateParts()) {
  return dateStr < reference.todayStr;
}

module.exports = {
  formatDateKey,
  getDateParts,
  getNow,
  getTimezoneOffsetHours,
  isPastDate,
  isReservaActive,
  isReservaPast,
};
