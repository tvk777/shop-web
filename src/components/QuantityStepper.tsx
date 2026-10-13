import { useState, type KeyboardEvent } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { clampQuantity, MAX_QUANTITY, MIN_QUANTITY } from '@/context/cartContext'

interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  // Item name, so screen readers hear which item the controls change.
  label: string
}

export function QuantityStepper({ value, onChange, label }: QuantityStepperProps) {
  // Draft text while typing, so an empty or partial field never reaches the cart.
  const [draft, setDraft] = useState(String(value))
  const [syncedValue, setSyncedValue] = useState(value)

  // The value changed from outside (buttons, cart line, reset after add): show it.
  // Adjusting state during render avoids an extra render with the old text.
  if (value !== syncedValue) {
    setSyncedValue(value)
    setDraft(String(value))
  }

  function commit() {
    if (draft === '') {
      setDraft(String(value))
      return
    }
    const next = clampQuantity(Number(draft))
    // Set the text too: when clamping lands on the current value, the sync above won't run.
    setDraft(String(next))
    if (next !== value) onChange(next)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      commit()
    } else if (event.key === 'Escape') {
      setDraft(String(value))
    }
  }

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
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={2}
        aria-label={`Quantity of ${label}`}
        value={draft}
        onChange={(event) => {
          // Digits only; anything else is ignored.
          if (/^\d*$/.test(event.target.value)) setDraft(event.target.value)
        }}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className="w-12 text-center"
      />
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
