import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type { Item } from '@/api/types'
import { useAuth } from '@/hooks/useAuth'
import { readCart, writeCart } from '@/lib/cartStorage'
import { toCents } from '@/lib/format'
import { CartContext, type CartContextValue } from './cartContext'
import { cartReducer, type CartState } from './cartReducer'

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
