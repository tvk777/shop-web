import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { SignupRequest } from '@/api/types'
import { useAuth } from '@/hooks/useAuth'

// The toast is shown in mutationFn, right after the signup resolves, so it does not depend
// on the signup page staying mounted.
export function useSignup() {
  const { signup } = useAuth()
  return useMutation({
    mutationFn: async (data: SignupRequest) => {
      const user = await signup(data)
      toast.success(`Welcome, ${user.first_name}`)
      return user
    },
  })
}
