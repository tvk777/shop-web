import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Item } from '@/api/types'
import { formatPrice } from '@/lib/format'

export function ItemCard({ item }: { item: Item }) {
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
      <CardFooter>
        {/* Step 5: quantity selector and "Add to cart" button go here. */}
        <div data-slot="item-actions" className="w-full" />
      </CardFooter>
    </Card>
  )
}
