'use strict';

const {
  getDateParts,
  isReservaActive,
  isReservaPast,
} = require('./dateUtils');

function getUniversityNow() {
  return getDateParts();
}

module.exports = {
  getUniversityNow,
  isReservaActive,
  isReservaPast,
};
