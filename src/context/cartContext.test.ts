import { describe, expect, it } from 'vitest'
import { clampQuantity } from './cartContext'

describe('clampQuantity', () => {
  it('keeps a quantity from 1 to 99 as it is', () => {
    expect(clampQuantity(1)).toBe(1)
    expect(clampQuantity(5)).toBe(5)
    expect(clampQuantity(99)).toBe(99)
  })

  it('raises a quantity below 1 to 1', () => {
    expect(clampQuantity(0)).toBe(1)
    expect(clampQuantity(-3)).toBe(1)
  })

  it('lowers a quantity above 99 to 99', () => {
    expect(clampQuantity(100)).toBe(99)
    expect(clampQuantity(1000)).toBe(99)
  })

  it('drops the decimal part', () => {
    expect(clampQuantity(2.7)).toBe(2)
    expect(clampQuantity(0.5)).toBe(1)
  })

  it('returns 1 for NaN', () => {
    expect(clampQuantity(NaN)).toBe(1)
  })

  it('returns 1 for Infinity', () => {
    // Known and accepted: not a finite number, so the minimum. The UI cannot produce it.
    expect(clampQuantity(Infinity)).toBe(1)
  })
})
