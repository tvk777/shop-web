import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Order } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { PageHeader } from '@/components/PageHeader'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useOrders } from '@/hooks/useOrders'
import { formatDateTime, formatPrice, itemsLabel, toCents } from '@/lib/format'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

function OrderCard({ order }: { order: Order }) {
  // Local to each card, so several orders can be open at once.
  const [open, setOpen] = useState(false)
  const linesId = `order-${order.id}-lines`
  const itemCount = order.items.reduce((sum, line) => sum + line.quantity, 0)

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-medium">Order #{order.id}</h2>
          <p className="text-muted-foreground">
            <time dateTime={order.created_at}>{formatDateTime(order.created_at)}</time>
            {' · '}
            {itemsLabel(itemCount)}
          </p>
        </div>
        {/* The server's total, not a recalculated one. */}
        <p className="text-base font-semibold">{formatPrice(order.amount)}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          aria-expanded={open}
          aria-controls={linesId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <ChevronUp /> : <ChevronDown />}
          {open ? 'Hide items' : 'Show items'}
        </Button>
        {/* Always rendered (only hidden), so aria-controls points to an existing element. */}
        <ul id={linesId} hidden={!open} className="divide-y">
          {order.items.map((line) => (
            <li key={line.item_id} className="flex items-start justify-between gap-4 py-2">
              <div className="min-w-0">
                <p className="font-medium break-words">{line.name}</p>
                <p className="text-muted-foreground">
                  {formatPrice(line.price)} × {line.quantity}
                </p>
              </div>
              <p className="shrink-0 font-medium">
                {formatPrice((toCents(line.price) * line.quantity) / 100)}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export function OrdersPage() {
  useDocumentTitle('My orders')
  const { data, isPending, isError, error, refetch } = useOrders()

  return (
    <>
      <PageHeader title="My orders" />

      {isPending ? (
        <LoadingState label="Loading orders…" />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Orders you place will appear here."
          action={
            <Link to="/" className={buttonVariants({ variant: 'outline' })}>
              Browse the catalog
            </Link>
          }
        />
      ) : (
        // Newest first, in the order the server returns them.
        <ul className="space-y-4">
          {data.map((order) => (
            <li key={order.id}>
              <OrderCard order={order} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
