/**
 * Currency formatter — Philippine Peso
 * fmt(120) → "₱120.00"
 */
export const fmt = (n) =>
  `₱${Number(n).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

/**
 * Returns today's date as YYYY-MM-DD string
 */
export const todayStr = () => new Date().toISOString().slice(0, 10)

/**
 * Short random ID generator
 */
export const genId = () => Math.random().toString(36).slice(2, 8).toUpperCase()
