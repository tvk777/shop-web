import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type { Item } from '@/api/types'
import { useAuth } from '@/hooks/useAuth'
import { readCart, writeCart } from '@/lib/cartStorage'
import { toCents } from '@/lib/format'
import { CartContext, clampQuantity, type CartContextValue, type CartLine } from './cartContext'

// userId is part of the state so a cart and its owner always change together:
// the persist effect can never write one user's lines under another user's key.
interface CartState {
  userId: number | null
  lines: CartLine[]
}

type CartAction =
  | { type: 'load'; userId: number | null; lines: CartLine[] }
  | { type: 'add'; line: CartLine }
  | { type: 'setQuantity'; itemId: number; quantity: number }
  | { type: 'remove'; itemId: number }
  | { type: 'clear' }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'load':
      return { userId: action.userId, lines: action.lines }
    case 'add': {
      const { line } = action
      const existing = state.lines.find((l) => l.itemId === line.itemId)
      if (!existing) {
        return { ...state, lines: [...state.lines, { ...line, quantity: clampQuantity(line.quantity) }] }
      }
      // Merge: keep the original price, only the quantity grows (capped at 99).
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.itemId === line.itemId ? { ...l, quantity: clampQuantity(l.quantity + line.quantity) } : l,
        ),
      }
    }
    case 'setQuantity':
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.itemId === action.itemId ? { ...l, quantity: clampQuantity(action.quantity) } : l,
        ),
      }
    case 'remove':
      return { ...state, lines: state.lines.filter((l) => l.itemId !== action.itemId) }
    case 'clear':
      return { ...state, lines: [] }
  }
}

function loadCart(userId: number | null): CartState {
  return { userId, lines: userId === null ? [] : readCart(userId) }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [state, dispatch] = useReducer(cartReducer, userId, loadCart)

  // The logged-in user changed (login, logout, 401): switch to that user's cart.
  // Adjusting state during render avoids a render with the previous user's cart.
  if (state.userId !== userId) {
    dispatch({ type: 'load', ...loadCart(userId) })
  }

  // Persisting is a side effect, not data fetching. Logged out: nothing to save.
  useEffect(() => {
    if (state.userId !== null) writeCart(state.userId, state.lines)
  }, [state])

  const addItem = useCallback((item: Item, quantity: number) => {
    dispatch({
      type: 'add',
      line: { itemId: item.id, name: item.name, price: item.price, quantity },
    })
  }, [])

  const setQuantity = useCallback((itemId: number, quantity: number) => {
    dispatch({ type: 'setQuantity', itemId, quantity })
  }, [])

  const removeItem = useCallback((itemId: number) => {
    dispatch({ type: 'remove', itemId })
  }, [])

  const clear = useCallback(() => dispatch({ type: 'clear' }), [])

  const value = useMemo<CartContextValue>(() => {
    const { lines } = state
    return {
      lines,
      itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
      totalCents: lines.reduce((sum, l) => sum + toCents(l.price) * l.quantity, 0),
      addItem,
      setQuantity,
      removeItem,
      clear,
    }
  }, [state, addItem, setQuantity, removeItem, clear])

  return <CartContext value={value}>{children}</CartContext>
}
