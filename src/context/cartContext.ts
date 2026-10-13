import { createContext } from 'react'
import type { Item } from '@/api/types'

// price is kept as the string the API sent when the item was added.
export interface CartLine {
  itemId: number
  name: string
  price: string
  quantity: number
}

export const MIN_QUANTITY = 1
export const MAX_QUANTITY = 99

// Whole numbers from 1 to 99.
export function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) return MIN_QUANTITY
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.trunc(value)))
}

export interface CartContextValue {
  lines: CartLine[]
  itemCount: number
  // Integer cents, to avoid floating point errors. Display with formatPrice(totalCents / 100).
  totalCents: number
  addItem: (item: Item, quantity: number) => void
  setQuantity: (itemId: number, quantity: number) => void
  removeItem: (itemId: number) => void
  clear: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)
