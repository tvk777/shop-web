import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

// TEMPORARY test buttons: replaced by the real login form in step 3.
const TEST_ACCOUNTS = ['user@example.com', 'admin@example.com']

export function LoginPage() {
  const { login } = useAuth()

  async function handleLogin(email: string) {
    try {
      await login(email, 'password123')
    } catch {
      toast.error('Login failed')
    }
  }

  return (
    <div className="space-y-4">
      <p>Login page</p>
      <div className="flex flex-wrap gap-2">
        {TEST_ACCOUNTS.map((email) => (
          <Button key={email} onClick={() => handleLogin(email)}>
            Log in as {email}
          </Button>
        ))}
      </div>
    </div>
  )
}
