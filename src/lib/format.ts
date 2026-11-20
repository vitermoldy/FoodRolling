// Numbers in Indonesian: decimal comma and the local short scale (ribu, juta, miliar, triliun).
const UNITS: [number, string][] = [
  [1e18, 'Kt'],
  [1e15, 'Kd'],
  [1e12, 'T'],
  [1e9, 'M'],
  [1e6, 'jt'],
  [1e3, 'rb'],
]

const formatters = new Map<number, Intl.NumberFormat>()
function number(value: number, digits: number) {
  let fmt = formatters.get(digits)
  if (!fmt) {
    fmt = new Intl.NumberFormat('id-ID', { maximumFractionDigits: digits, minimumFractionDigits: 0 })
    formatters.set(digits, fmt)
  }
  return fmt.format(value)
}

export function formatCoins(value: number): string {
  if (!Number.isFinite(value)) return '-'
  const abs = Math.abs(value)
  for (const [size, unit] of UNITS) {
    if (abs >= size) {
      const v = value / size
      return `${number(v, Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2)} ${unit}`
    }
  }
  return number(value, abs >= 100 ? 0 : abs >= 10 ? 1 : 2)
}

export function formatRate(value: number): string {
  return `${formatCoins(value)}/detik`
}

