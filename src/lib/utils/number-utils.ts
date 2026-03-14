export function formatMoneyNumber(
  n?: number,
  options?: { fiat?: string }
): string {
  const fiat = options?.fiat ?? '€'
  return fiat + ' ' + formatNumber(n)
}

export function formatNumber(n?: number | unknown): string {
  if (typeof n === 'number')
    return n
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, 'T') // we want german: all non thousand separators should be replaced with comma, save as "T"
      .replace(',', '.') // we want german: all thousand separators should be replaced with .dot
      .replaceAll('T', ',') // we want german: all saved Ts should be replaced with a comma
  return '--,-'
}

export function minOrZero(a: number, b: number) {
  return Math.max(0, Math.min(a, b))
}

export function n2(n: number): string {
  if (n < 10) {
    return '0' + n
  }
  return '' + n
}

export const addLeadingZeros = (
  value: string,
  minLength: number = 10
): string => {
  return value.padStart(minLength, '0')
}
