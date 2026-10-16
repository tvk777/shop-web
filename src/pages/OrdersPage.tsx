import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Order } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { PageHeader } from '@/components/PageHeader'
import { Pagination } from '@/components/Pagination'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useOrders } from '@/hooks/useOrders'
import { formatDateTime, formatPrice, itemsLabel, toCents } from '@/lib/format'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useClampPage, usePageParam } from '@/hooks/usePageParam'

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
  const { page, setPage } = usePageParam()
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useOrders(page)
  const outOfRange = useClampPage(page, isPlaceholderData ? undefined : data?.meta, setPage)

  // Focusing the count scrolls to the top of the list and keeps keyboard focus on the page
  // while the clicked button is disabled.
  const countRef = useRef<HTMLParagraphElement>(null)
  function goToPage(next: number) {
    setPage(next)
    countRef.current?.focus()
  }

  return (
    <>
      <PageHeader title="My orders" />

      {isPending || outOfRange ? (
        <LoadingState label="Loading orders…" />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data.data.length === 0 ? (
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
        <div className={isPlaceholderData ? 'opacity-60' : undefined}>
          {/* The total over all pages, not just this one. */}
          <p ref={countRef} tabIndex={-1} className="mb-4 text-sm text-muted-foreground">
            {data.meta.total} {data.meta.total === 1 ? 'order' : 'orders'}
          </p>
          {/* Newest first, in the order the server returns them. */}
          <ul className="space-y-4">
            {data.data.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} />
              </li>
            ))}
          </ul>
          <Pagination
            page={page}
            totalPages={data.meta.total_pages}
            onPageChange={goToPage}
            disabled={isPlaceholderData}
          />
        </div>
      )}
    </>
  )
}
