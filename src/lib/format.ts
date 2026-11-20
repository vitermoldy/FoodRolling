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
