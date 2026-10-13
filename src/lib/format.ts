const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

// Prices arrive as strings ("12.9"); convert only for display.
export function formatPrice(value: string | number): string {
  const amount = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(amount)) return String(value)
  return priceFormatter.format(amount)
}

// Money math is done in integer cents: "12.9" -> 1290.
export function toCents(price: string): number {
  return Math.round(Number(price) * 100)
}

// undefined = the browser's locale, so dates read the way the user expects.
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return dateTimeFormatter.format(date)
}

export function itemsLabel(count: number): string {
  return `${count} ${count === 1 ? 'item' : 'items'}`
}
