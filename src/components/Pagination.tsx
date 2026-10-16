import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  // True while the next page loads: both buttons wait for it.
  disabled?: boolean
}

// Hidden when everything fits on one page.
export function Pagination({ page, totalPages, onPageChange, disabled = false }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-2">
      <Button
        variant="outline"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft />
        Previous
      </Button>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <Button
        variant="outline"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <ChevronRight />
      </Button>
    </nav>
  )
}
