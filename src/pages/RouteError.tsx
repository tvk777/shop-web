import { useEffect } from 'react'
import { Link, useRouteError } from 'react-router'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Router-level errorElement: a rendering error shows this instead of a blank page.
// The error itself goes to the console only, it is not shown to the user.
export function RouteError() {
  const error = useRouteError()
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <Card role="alert">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This page could not be shown. Please try again or go back to the catalog.
          </p>
          <Link to="/" className={buttonVariants({ variant: 'outline' })}>
            Back to the catalog
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}
