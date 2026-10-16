import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getOrders } from '@/api/orders'
import { queryKeys } from '@/lib/queryKeys'

// Under orders.all, so placing an order (useCreateOrder) refetches every page.
// keepPreviousData keeps the old page on screen while the next one loads.
export function useOrders(page: number) {
  return useQuery({
    queryKey: queryKeys.orders.list(page),
    queryFn: () => getOrders(page),
    placeholderData: keepPreviousData,
  })
}
