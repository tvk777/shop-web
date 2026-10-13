import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getItems } from '@/api/items'
import { queryKeys } from '@/lib/queryKeys'

// keepPreviousData keeps the old list on screen while a new search loads.
export function useItems(q: string) {
  return useQuery({
    queryKey: queryKeys.items.list(q),
    queryFn: () => getItems(q || undefined),
    placeholderData: keepPreviousData,
  })
}
