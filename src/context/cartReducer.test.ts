import { describe, expect, it } from 'vitest'
import type { CartLine } from './cartContext'
import { cartReducer, type CartState } from './cartReducer'

const apple: CartLine = { itemId: 1, name: 'Apple', price: '1.50', quantity: 2 }
const bread: CartLine = { itemId: 2, name: 'Bread', price: '3.20', quantity: 1 }

function cart(...lines: CartLine[]): CartState {
  return { userId: 7, lines }
}

describe('cartReducer', () => {
  describe('add', () => {
    it('adds a new line', () => {
      const state = cartReducer(cart(apple), { type: 'add', line: bread })
      expect(state.lines).toEqual([apple, bread])
    })

    it('merges the same item into one line and keeps the original price', () => {
      const state = cartReducer(cart(apple), {
        type: 'add',
        line: { ...apple, price: '9.99', quantity: 3 },
      })
      expect(state.lines).toEqual([{ ...apple, quantity: 5 }])
    })

    it('caps a merged quantity at 99', () => {
      const state = cartReducer(cart({ ...apple, quantity: 98 }), {
        type: 'add',
        line: { ...apple, quantity: 5 },
      })
      expect(state.lines[0].quantity).toBe(99)
    })

    it('clamps the quantity of a new line', () => {
      const state = cartReducer(cart(), { type: 'add', line: { ...apple, quantity: 500 } })
      expect(state.lines[0].quantity).toBe(99)
    })
  })

  it('setQuantity changes one line and clamps the value', () => {
    const start = cart(apple, bread)
    expect(cartReducer(start, { type: 'setQuantity', itemId: 1, quantity: 4 }).lines).toEqual([
      { ...apple, quantity: 4 },
      bread,
    ])
    expect(cartReducer(start, { type: 'setQuantity', itemId: 1, quantity: 0 }).lines[0].quantity).toBe(1)
    expect(cartReducer(start, { type: 'setQuantity', itemId: 1, quantity: 150 }).lines[0].quantity).toBe(
      99,
    )
  })

  it('remove deletes the line', () => {
    const state = cartReducer(cart(apple, bread), { type: 'remove', itemId: 1 })
    expect(state.lines).toEqual([bread])
  })

  it('clear empties the cart and keeps the user', () => {
    const state = cartReducer(cart(apple, bread), { type: 'clear' })
    expect(state).toEqual({ userId: 7, lines: [] })
  })

  it('load replaces the user and the lines', () => {
    const state = cartReducer(cart(apple), { type: 'load', userId: 8, lines: [bread] })
    expect(state).toEqual({ userId: 8, lines: [bread] })
  })

  it('does not change the previous state', () => {
    const start = cart({ ...apple })
    cartReducer(start, { type: 'add', line: apple })
    cartReducer(start, { type: 'setQuantity', itemId: 1, quantity: 10 })
    cartReducer(start, { type: 'remove', itemId: 1 })
    expect(start).toEqual(cart(apple))
  })
})
