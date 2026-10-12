import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
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
    <>
      <PageHeader title="Log in" />
      <div className="flex flex-col gap-2">
        {TEST_ACCOUNTS.map((email) => (
          <Button key={email} onClick={() => handleLogin(email)}>
            Log in as {email}
          </Button>
        ))}
      </div>
    </>
  )
}
