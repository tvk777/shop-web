import { Link } from 'react-router'
import { Trash2 } from 'lucide-react'
import { parseUnavailableItemIds } from '@/api/orders'
import { EmptyState } from '@/components/EmptyState'
import { FormErrors } from '@/components/FormErrors'
import { PageHeader } from '@/components/PageHeader'
import { QuantityStepper } from '@/components/QuantityStepper'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useCart } from '@/hooks/useCart'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useCreateOrder } from '@/hooks/useCreateOrder'
import { getErrorMessages } from '@/lib/errors'
import { formatPrice, itemsLabel, toCents } from '@/lib/format'

export function CartPage() {
  useDocumentTitle('Cart')
  const { lines, itemCount, totalCents, setQuantity, removeItem, clear } = useCart()
  const createOrder = useCreateOrder()
  // Derived from the error, so a new attempt (which resets the error) clears the marks.
  const unavailableIds = new Set(parseUnavailableItemIds(createOrder.error) ?? [])

  // Any change to the cart makes the last error outdated. Reset here, in the handlers,
  // because they are the only way lines change on this page (no effect needed).
  function handleQuantity(itemId: number, quantity: number) {
    createOrder.reset()
    setQuantity(itemId, quantity)
  }

  function handleRemove(itemId: number) {
    createOrder.reset()
    removeItem(itemId)
  }

  function handleClear() {
    createOrder.reset()
    clear()
  }

  if (lines.length === 0) {
    return (
      <>
        <PageHeader title="Cart" />
        <EmptyState
          title="Your cart is empty"
          description="Add items from the catalog to see them here."
          action={
            <Link to="/" className={buttonVariants({ variant: 'outline' })}>
              Browse the catalog
            </Link>
          }
        />
      </>
    )
  }

  return (
    <>
      <PageHeader title="Cart" />

      {/* One stacked list for every width: a table would squeeze the stepper at 375px. */}
      <Card className="mb-6">
        <CardContent>
          <ul className="divide-y">
            {lines.map((line) => (
              <li
                key={line.itemId}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium break-words">{line.name}</p>
                  {unavailableIds.has(line.itemId) && (
                    <Badge variant="destructive">No longer available</Badge>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(line.price)} each
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <QuantityStepper
                    value={line.quantity}
                    onChange={(quantity) => handleQuantity(line.itemId, quantity)}
                    label={line.name}
                  />
                  <p className="w-24 text-right font-medium">
                    {formatPrice((toCents(line.price) * line.quantity) / 100)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${line.name}`}
                    onClick={() => handleRemove(line.itemId)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {createOrder.isError && (
        <div className="mb-6">
          <FormErrors
            errors={
              unavailableIds.size > 0
                ? ['Some items are no longer available. Remove them to continue.']
                : getErrorMessages(createOrder.error)
            }
          />
        </div>
      )}

      <Card>
        <CardContent className="space-y-1">
          <p className="flex justify-between gap-2 text-lg font-semibold">
            <span>Total ({itemsLabel(itemCount)})</span>
            <span>{formatPrice(totalCents / 100)}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Prices are confirmed by the server at checkout.
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={createOrder.isPending}>
                Clear cart
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear cart?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes all {itemsLabel(itemCount)} from your cart.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleClear}>
                  Clear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {/* Disabled while pending, so a double click cannot create two orders. */}
          <Button disabled={createOrder.isPending} onClick={() => createOrder.mutate(lines)}>
            {createOrder.isPending ? 'Placing order…' : `Pay ${formatPrice(totalCents / 100)}`}
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
