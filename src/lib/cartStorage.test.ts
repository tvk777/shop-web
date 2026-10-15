import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readCart } from './cartStorage'

// Tests run in Node, which has no browser localStorage. A small in-memory fake is enough:
// readCart only calls getItem.
let stored: Map<string, string>

beforeEach(() => {
  stored = new Map()
  vi.stubGlobal('localStorage', { getItem: (key: string) => stored.get(key) ?? null })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// Saves a value the way the app does, under the key of user 7.
function save(value: unknown) {
  stored.set('shop.cart.7', typeof value === 'string' ? value : JSON.stringify(value))
}

const apple = { itemId: 1, name: 'Apple', price: '1.50', quantity: 2 }

describe('readCart', () => {
  it('returns the saved lines', () => {
    save([apple, { itemId: 2, name: 'Bread', price: '3', quantity: 1 }])
    expect(readCart(7)).toEqual([apple, { itemId: 2, name: 'Bread', price: '3', quantity: 1 }])
  })

  it("reads only the given user's cart", () => {
    save([apple])
    expect(readCart(8)).toEqual([])
  })

  it('returns an empty cart when nothing is saved', () => {
    expect(readCart(7)).toEqual([])
  })

  it('returns an empty cart for invalid JSON', () => {
    save('{not json')
    expect(readCart(7)).toEqual([])
  })

  it('returns an empty cart when the data is not a list', () => {
    save({ itemId: 1 })
    expect(readCart(7)).toEqual([])
    save('null')
    expect(readCart(7)).toEqual([])
  })

  it('drops lines with a wrong shape and keeps the good ones', () => {
    save([
      apple,
      null,
      'apple',
      { ...apple, itemId: '1' },
      { ...apple, name: 42 },
      { ...apple, price: 1.5 },
      { ...apple, quantity: '2' },
      { itemId: 3, name: 'No price', quantity: 1 },
    ])
    expect(readCart(7)).toEqual([apple])
  })

  it('drops lines whose price is not a valid amount', () => {
    save([
      { ...apple, price: 'abc' },
      { ...apple, price: '' },
      { ...apple, price: '-5' },
      { ...apple, price: '12.9' },
      { ...apple, price: '0' },
    ])
    expect(readCart(7)).toEqual([
      { ...apple, price: '12.9' },
      { ...apple, price: '0' },
    ])
  })

  it('clamps a quantity out of range', () => {
    save([
      { ...apple, quantity: 0 },
      { ...apple, quantity: 500 },
      { ...apple, quantity: 2.5 },
    ])
    expect(readCart(7).map((line) => line.quantity)).toEqual([1, 99, 2])
  })

  it('returns an empty cart when storage throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('Storage is blocked')
      },
    })
    expect(readCart(7)).toEqual([])
  })
})
