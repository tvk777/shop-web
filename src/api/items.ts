import { api } from '@/lib/api'
import type { Item } from './types'

// GET /items returns a bare array. q is left out when empty.
export async function getItems(q?: string): Promise<Item[]> {
  const response = await api.get<Item[]>('/items', {
    params: q ? { q } : undefined,
  })
  return response.data
}
