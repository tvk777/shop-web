import { Outlet } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'

// Shell for /login and /signup: a narrow centered card, no navigation.
export function PublicLayout() {
  return (
    <main className="mx-auto flex min-h-svh max-w-sm items-center px-4 py-6">
      <Card className="w-full">
        <CardContent>
          <Outlet />
        </CardContent>
      </Card>
    </main>
  )
}
