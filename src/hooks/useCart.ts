import { use } from 'react'
import { CartContext } from '@/context/cartContext'

export function useCart() {
  const context = use(CartContext)
  if (!context) throw new Error('useCart must be used inside <CartProvider>')
  return context
}
