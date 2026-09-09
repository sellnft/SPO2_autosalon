export function formatMileage(mileage) {
  if (!mileage && mileage !== 0) return ''
  return `${new Intl.NumberFormat('ru-RU').format(mileage)} км`
}