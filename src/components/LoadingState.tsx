import { Card, CardContent } from '@/components/ui/card'

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <Card>
      <CardContent>
        <p role="status" className="text-muted-foreground">
          {label}
        </p>
      </CardContent>
    </Card>
  )
}
