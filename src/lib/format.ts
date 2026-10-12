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
