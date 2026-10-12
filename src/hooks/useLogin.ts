import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

interface LoginVariables {
  email: string
  password: string
}

// On success RedirectIfAuthenticated moves the user on, so this hook never navigates.
// The toast is shown in mutationFn, right after the login resolves, so it does not depend
// on the login page staying mounted.
export function useLogin() {
  const { login } = useAuth()
  return useMutation({
    mutationFn: async ({ email, password }: LoginVariables) => {
      const user = await login(email, password)
      toast.success(`Welcome, ${user.first_name}`)
      return user
    },
  })
}
