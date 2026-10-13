import { useState } from 'react'
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
  const { addItem } = useCart()
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
      <CardFooter className="flex flex-wrap items-center justify-between gap-2">
        <QuantityStepper value={quantity} onChange={setQuantity} label={item.name} />
        <Button onClick={handleAdd}>Add to cart</Button>
      </CardFooter>
    </Card>
  )
}
