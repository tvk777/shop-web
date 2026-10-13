import { Link } from 'react-router'
import { Trash2 } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
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
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useCart } from '@/hooks/useCart'
import { formatPrice, toCents } from '@/lib/format'

function itemsLabel(count: number) {
  return `${count} ${count === 1 ? 'item' : 'items'}`
}

export function CartPage() {
  const { lines, itemCount, totalCents, setQuantity, removeItem, clear } = useCart()

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
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(line.price)} each
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <QuantityStepper
                    value={line.quantity}
                    onChange={(quantity) => setQuantity(line.itemId, quantity)}
                    label={line.name}
                  />
                  <p className="w-24 text-right font-medium">
                    {formatPrice((toCents(line.price) * line.quantity) / 100)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${line.name}`}
                    onClick={() => removeItem(line.itemId)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

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
              <Button variant="outline">Clear cart</Button>
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
                <AlertDialogAction variant="destructive" onClick={clear}>
                  Clear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="flex flex-col items-end gap-1">
            <Button disabled>Checkout</Button>
            <p className="text-xs text-muted-foreground">Checkout arrives in step 6.</p>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
