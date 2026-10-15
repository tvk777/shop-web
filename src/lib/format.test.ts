import { describe, expect, it } from 'vitest'
import { formatPrice, toCents } from './format'

describe('toCents', () => {
  it('converts a string price to whole cents', () => {
    expect(toCents('12.9')).toBe(1290)
    expect(toCents('12.90')).toBe(1290)
    expect(toCents('5')).toBe(500)
    expect(toCents('0')).toBe(0)
  })

  it('rounds away floating point errors', () => {
    // 0.29 * 100 is 28.999999999999996 in JavaScript, 1.15 * 100 is 114.99999999999999.
    expect(toCents('0.29')).toBe(29)
    expect(toCents('1.15')).toBe(115)
    expect(toCents('19.99')).toBe(1999)
  })

  it('makes 3 x "12.90" exactly $38.70', () => {
    const totalCents = toCents('12.90') * 3
    expect(totalCents).toBe(3870)
    expect(formatPrice(totalCents / 100)).toBe('$38.70')
  })

  it('returns NaN for a non-numeric price', () => {
    // readCart drops such lines before they reach the cart total.
    expect(toCents('abc')).toBeNaN()
  })
})

describe('formatPrice', () => {
  it('formats a string price as dollars', () => {
    expect(formatPrice('12.9')).toBe('$12.90')
    expect(formatPrice('0')).toBe('$0.00')
  })

  it('formats a number', () => {
    expect(formatPrice(38.7)).toBe('$38.70')
    expect(formatPrice(1234.5)).toBe('$1,234.50')
  })

  it('rounds to two decimals', () => {
    // 0.1 + 0.2 is 0.30000000000000004.
    expect(formatPrice(0.1 + 0.2)).toBe('$0.30')
  })

  it('returns a non-numeric value unchanged', () => {
    expect(formatPrice('abc')).toBe('abc')
  })

  it('formats an empty string as $0.00', () => {
    // Known and accepted: Number('') is 0. The API never sends an empty price.
    expect(formatPrice('')).toBe('$0.00')
  })
})
