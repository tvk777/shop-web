// Cart persistence, one key per user so a shared browser never shows someone else's cart.
// Storage may be blocked (private mode): the cart then lives in memory until the page reloads.
import { clampQuantity, type CartLine } from '@/context/cartContext'

function storageKey(userId: number) {
  return `shop.cart.${userId}`
}

// localStorage can hold old or hand-edited data, so keep only well-formed lines.
function toCartLine(value: unknown): CartLine | null {
  if (typeof value !== 'object' || value === null) return null
  const { itemId, name, price, quantity } = value as Record<string, unknown>
  if (typeof itemId !== 'number' || typeof name !== 'string' || typeof price !== 'string') {
    return null
  }
  if (typeof quantity !== 'number') return null
  return { itemId, name, price, quantity: clampQuantity(quantity) }
}

export function readCart(userId: number): CartLine[] {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(toCartLine).filter((line) => line !== null)
  } catch {
    return []
  }
}

export function writeCart(userId: number, lines: CartLine[]) {
  try {
    if (lines.length === 0) localStorage.removeItem(storageKey(userId))
    else localStorage.setItem(storageKey(userId), JSON.stringify(lines))
  } catch {
    // Storage unavailable: the cart is kept in memory only.
  }
}
