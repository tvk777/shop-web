import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateProfile } from '@/api/profile'
import { queryKeys } from '@/lib/queryKeys'

// Success work lives in the hook-level onSuccess, so it runs even if the page unmounts.
// Errors are left to the form that sent the request.
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (user, variables) => {
      // AuthProvider reads the user from this cache entry, so the header updates at once.
      queryClient.setQueryData(queryKeys.profile, user)
      toast.success(
        'password' in variables
          ? 'Password changed. Other devices were logged out.'
          : 'Profile updated',
      )
    },
  })
}
