import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getErrorMessages } from '@/lib/errors'

interface ErrorStateProps {
  error: unknown
  onRetry?: () => void
  // Extra actions shown next to "Try again".
  children?: ReactNode
}

export function ErrorState({ error, onRetry, children }: ErrorStateProps) {
  return (
    <Card role="alert">
      <CardHeader>
        <CardTitle>Something went wrong</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-1 text-destructive">
          {getErrorMessages(error).map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
        {(onRetry || children) && (
          <div className="flex flex-wrap gap-2">
            {onRetry && (
              <Button variant="outline" onClick={onRetry}>
                Try again
              </Button>
            )}
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
