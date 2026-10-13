import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { createOrder } from '@/api/orders'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'

// All success work lives in the hook-level onSuccess: callbacks passed to mutate() are
// dropped when the calling component unmounts, these always run.
// On error nothing happens here, so the cart stays untouched.
export function useCreateOrder() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { clear } = useCart()

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      // Not returned: the mutation should not stay pending until the refetch finishes.
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      toast.success(`Order #${order.id} placed, total ${formatPrice(order.amount)}`)
      // Navigate before clearing, so the cart page never flashes its empty state.
      void navigate('/orders')
      clear()
    },
  })
}
