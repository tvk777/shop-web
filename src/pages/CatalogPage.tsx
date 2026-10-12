import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export function CatalogPage() {
  const { user, logout } = useAuth()

  return (
    <div className="space-y-4">
      <p>Catalog page</p>
      {/* TEMPORARY: replaced by the navigation in step 2. */}
      <p>Logged in as {user?.email}</p>
      <Button variant="outline" onClick={() => logout()}>
        Log out
      </Button>
    </div>
  )
}
