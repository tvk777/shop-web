import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { ItemCard } from '@/components/ItemCard'
import { LoadingState } from '@/components/LoadingState'
import { PageHeader } from '@/components/PageHeader'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useItems } from '@/hooks/useItems'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useClampPage, usePageParam } from '@/hooks/usePageParam'

export function CatalogPage() {
  useDocumentTitle('Catalog')
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQ = (searchParams.get('q') ?? '').trim()
  const { page, setPage } = usePageParam()

  // The input is local state so typing never lags; the URL is the source of truth for the query.
  const [input, setInput] = useState(urlQ)
  const [syncedUrlQ, setSyncedUrlQ] = useState(urlQ)
  // Back/forward changed the URL from outside: make the input follow it.
  if (urlQ !== syncedUrlQ) {
    setSyncedUrlQ(urlQ)
    setInput(urlQ)
  }

  const debounced = useDebouncedValue(input, 300).trim()

  // Reads the latest urlQ and setSearchParams without making them triggers:
  // only a new debounced value should write to the URL.
  const writeQuery = useEffectEvent((q: string) => {
    // Skip when the URL already matches (after Clear search, or a back/forward navigation).
    if (q === urlQ) return
    // A fresh object, so ?page= is dropped in the same update: a new search starts on page 1.
    setSearchParams(q ? { q } : {}, { replace: true })
  })

  useEffect(() => {
    writeQuery(debounced)
  }, [debounced])

  const { data, isPending, isError, error, refetch, isPlaceholderData } =
    useItems(urlQ, page)
  const outOfRange = useClampPage(page, isPlaceholderData ? undefined : data?.meta, setPage)

  // Clears q and page together.
  function clearSearch() {
    setInput('')
    setSearchParams({}, { replace: true })
  }

  // Only page changes, so the debounced value stays the same and writeQuery does not run.
  // Focusing the count scrolls to the top of the list and keeps keyboard focus on the page
  // while the clicked button is disabled.
  const countRef = useRef<HTMLParagraphElement>(null)
  function goToPage(next: number) {
    setPage(next)
    countRef.current?.focus()
  }

  return (
    <>
      <PageHeader title="Catalog" />
      <Input
        type="search"
        aria-label="Search items"
        placeholder="Search items…"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        className="mb-6"
      />

      {isPending || outOfRange ? (
        <LoadingState label="Loading items…" />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data.data.length === 0 ? (
        <EmptyState
          title={urlQ ? `No items match “${urlQ}”` : 'No items yet'}
          action={
            urlQ ? (
              <Button variant="outline" onClick={clearSearch}>
                Clear search
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className={isPlaceholderData ? 'opacity-60' : undefined}>
          {/* The total over all pages, not just this one. */}
          <p
            ref={countRef}
            tabIndex={-1}
            aria-live="polite"
            className="mb-4 text-sm text-muted-foreground"
          >
            {data.meta.total} {data.meta.total === 1 ? 'item' : 'items'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
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
