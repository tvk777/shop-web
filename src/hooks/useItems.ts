import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getItems } from '@/api/items'
import { queryKeys } from '@/lib/queryKeys'

// keepPreviousData keeps the old page on screen while a new search or page loads.
export function useItems(q: string, page: number) {
  return useQuery({
    queryKey: queryKeys.items.list(q, page),
    queryFn: () => getItems({ q: q || undefined, page }),
    placeholderData: keepPreviousData,
  })
}
