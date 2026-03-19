export function toLocalDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getLocalToday() {
  return toLocalDateInputValue(new Date());
}

export function getLocalDateMonthsAgo(monthsAgo) {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  return toLocalDateInputValue(date);
}
