import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getAdminUsers, updateAdminUser } from '@/api/admin'
import type { AdminUserUpdate, User } from '@/api/types'
import { queryKeys } from '@/lib/queryKeys'

export function useAdminUsers() {
  return useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: getAdminUsers,
  })
}

// Success work lives in the hook-level onSuccess, so it runs even if the dialog unmounts.
// Errors are left to the form that sent the request.
export function useUpdateAdminUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminUserUpdate }) => updateAdminUser(id, data),
    onSuccess: (user) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.users })
      // The admin edited themselves: AuthProvider reads this entry, so the header updates at once.
      const current = queryClient.getQueryData<User>(queryKeys.profile)
      if (current?.id === user.id) queryClient.setQueryData(queryKeys.profile, user)
      toast.success(`${user.first_name} ${user.last_name} updated`)
    },
  })
}
