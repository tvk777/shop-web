import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getErrorMessages } from '@/lib/errors'

interface ErrorStateProps {
  error: unknown
  onRetry?: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
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
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
