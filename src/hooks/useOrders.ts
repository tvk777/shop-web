import { useQuery } from '@tanstack/react-query'
import { getOrders } from '@/api/orders'
import { queryKeys } from '@/lib/queryKeys'

// Under orders.all, so placing an order (useCreateOrder) refetches this list.
export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders.list,
    queryFn: getOrders,
  })
}
