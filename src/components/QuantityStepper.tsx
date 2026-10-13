import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MAX_QUANTITY, MIN_QUANTITY } from '@/context/cartContext'

interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  // Item name, so screen readers hear which item the buttons change.
  label: string
}

export function QuantityStepper({ value, onChange, label }: QuantityStepperProps) {
  return (
    <div role="group" aria-label={`Quantity of ${label}`} className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={`Decrease quantity of ${label}`}
        disabled={value <= MIN_QUANTITY}
        onClick={() => onChange(value - 1)}
      >
        <Minus />
      </Button>
      <span aria-live="polite" className="w-6 text-center">
        {value}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={`Increase quantity of ${label}`}
        disabled={value >= MAX_QUANTITY}
        onClick={() => onChange(value + 1)}
      >
        <Plus />
      </Button>
    </div>
  )
}
