import { isAxiosError } from 'axios'
import { api } from '@/lib/api'
import type { CartLine } from '@/context/cartContext'
import type { Order } from './types'

// Only ids and quantities are sent: the server calculates prices and the total.
export async function createOrder(lines: Pick<CartLine, 'itemId' | 'quantity'>[]): Promise<Order> {
  const response = await api.post<Order>('/orders', {
    order: {
      items: lines.map((line) => ({ item_id: line.itemId, quantity: line.quantity })),
    },
  })
  return response.data
}

const ITEMS_NOT_FOUND = /^Items not found:\s*(\d+(?:\s*,\s*\d+)*)\s*$/

// A 422 {errors: ["Items not found: 12, 15"]} means items were deleted after they were added
// to the cart. Returns their ids, or null when the error has any other shape.
export function parseUnavailableItemIds(error: unknown): number[] | null {
  if (!isAxiosError(error) || error.response?.status !== 422) return null
  const errors: unknown = error.response.data?.errors
  if (!Array.isArray(errors)) return null
  for (const message of errors) {
    if (typeof message !== 'string') continue
    const match = ITEMS_NOT_FOUND.exec(message)
    if (match) return match[1].split(',').map((id) => Number(id.trim()))
  }
  return null
}

// GET /orders returns every order of the current user with its lines, newest first.
export async function getOrders(): Promise<Order[]> {
  const response = await api.get<Order[]>('/orders')
  return response.data
}
