import { api } from '@/lib/api'
import type { AdminUser, AdminUserUpdate, Item, ItemInput, Paginated, User } from './types'

// The lists are paginated ({ data, meta }); single records come bare (no { user } / { item }
// wrapper). per_page is not sent: the server default (20) is used.

export async function getAdminUsers(page: number): Promise<Paginated<AdminUser>> {
  const response = await api.get<Paginated<AdminUser>>('/admin/users', { params: { page } })
  return response.data
}

export async function updateAdminUser(id: number, data: AdminUserUpdate): Promise<User> {
  const response = await api.patch<User>(`/admin/users/${id}`, { user: data })
  return response.data
}

// Deletes the user with all their orders. 204 on success, 422 for your own account or the
// last admin.
export async function deleteAdminUser(id: number): Promise<void> {
  await api.delete(`/admin/users/${id}`)
}

// q is left out when empty, as in GET /items.
export async function getAdminItems({
  q,
  page,
}: {
  q?: string
  page: number
}): Promise<Paginated<Item>> {
  const response = await api.get<Paginated<Item>>('/admin/items', {
    params: q ? { q, page } : { page },
  })
  return response.data
}

export async function createAdminItem(data: ItemInput): Promise<Item> {
  const response = await api.post<Item>('/admin/items', { item: data })
  return response.data
}

export async function updateAdminItem(id: number, data: ItemInput): Promise<Item> {
  const response = await api.patch<Item>(`/admin/items/${id}`, { item: data })
  return response.data
}

// 204 on success, 422 when the item is used in orders.
export async function deleteAdminItem(id: number): Promise<void> {
  await api.delete(`/admin/items/${id}`)
}
