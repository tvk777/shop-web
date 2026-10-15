import { clampQuantity, type CartLine } from './cartContext'

// userId is part of the state so a cart and its owner always change together:
// the persist effect can never write one user's lines under another user's key.
export interface CartState {
  userId: number | null
  lines: CartLine[]
}

export type CartAction =
  | { type: 'load'; userId: number | null; lines: CartLine[] }
  | { type: 'add'; line: CartLine }
  | { type: 'setQuantity'; itemId: number; quantity: number }
  | { type: 'remove'; itemId: number }
  | { type: 'clear' }

export function cartReducer(state: CartState, action: CartAction): CartState {
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
