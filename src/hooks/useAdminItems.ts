import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createAdminItem, deleteAdminItem, getAdminItems, updateAdminItem } from '@/api/admin'
import type { Item, ItemInput } from '@/api/types'
import { queryKeys } from '@/lib/queryKeys'

// keepPreviousData keeps the old page on screen while a new search or page loads.
export function useAdminItems(q: string, page: number) {
  return useQuery({
    queryKey: queryKeys.admin.items.list(q, page),
    queryFn: () => getAdminItems({ q: q || undefined, page }),
    placeholderData: keepPreviousData,
  })
}

// Every item change refreshes the admin list and the catalog.
function useInvalidateItems() {
  const queryClient = useQueryClient()
  return () => {
    // Not returned: the mutation should not stay pending until the refetch finishes.
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.items.all })
    void queryClient.invalidateQueries({ queryKey: queryKeys.items.all })
  }
}

// Success work lives in the hook-level onSuccess, so it runs even if the dialog unmounts.
// Errors are left to the dialog that sent the request.
export function useCreateAdminItem() {
  const invalidate = useInvalidateItems()
  return useMutation({
    mutationFn: createAdminItem,
    onSuccess: (item) => {
      invalidate()
      toast.success(`${item.name} created`)
    },
  })
}

export function useUpdateAdminItem() {
  const invalidate = useInvalidateItems()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ItemInput }) => updateAdminItem(id, data),
    onSuccess: (item) => {
      invalidate()
      toast.success(`${item.name} updated`)
    },
  })
}

// Takes the whole item so the toast can name it; a 422 (used in orders) leaves it in place.
export function useDeleteAdminItem() {
  const invalidate = useInvalidateItems()
  return useMutation({
    mutationFn: (item: Item) => deleteAdminItem(item.id),
    onSuccess: (_data, item) => {
      invalidate()
      toast.success(`${item.name} deleted`)
    },
  })
}
