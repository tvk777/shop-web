import { api } from '@/lib/api'
import type { Item, Paginated } from './types'

// q is left out when empty. per_page is not sent: the server default (12) is used.
export async function getItems({ q, page }: { q?: string; page: number }): Promise<Paginated<Item>> {
  const response = await api.get<Paginated<Item>>('/items', {
    params: q ? { q, page } : { page },
  })
  return response.data
}
