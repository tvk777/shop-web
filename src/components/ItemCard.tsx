import { useState } from 'react'
import { Link } from 'react-router'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import { QuantityStepper } from '@/components/QuantityStepper'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Item } from '@/api/types'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/format'

export function ItemCard({ item }: { item: Item }) {
  const { lines, addItem } = useCart()
  const inCart = lines.find((line) => line.itemId === item.id)?.quantity ?? 0
  const [quantity, setQuantity] = useState(1)

  function handleAdd() {
    addItem(item, quantity)
    toast.success(`Added ${item.name} to cart`)
    setQuantity(1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        {item.description && (
          <p className="line-clamp-3 text-muted-foreground">{item.description}</p>
        )}
        <p className="font-medium">{formatPrice(item.price)}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-2">
        {/* Always rendered: a fixed-height slot keeps cards aligned, and a live region
            that already exists is announced reliably when its text appears. */}
        <p aria-live="polite" className="flex h-5 items-center gap-1 text-sm text-muted-foreground">
          {inCart > 0 && (
            <>
              <Check className="size-4" aria-hidden="true" />
              <span>{inCart} in cart</span>
              <span aria-hidden="true">·</span>
              <Link to="/cart" className="underline underline-offset-4 hover:text-foreground">
                View cart
              </Link>
            </>
          )}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <QuantityStepper value={quantity} onChange={setQuantity} label={item.name} />
          <Button onClick={handleAdd}>Add to cart</Button>
        </div>
      </CardFooter>
    </Card>
  )
}
