import { useEffect, useEffectEvent, useState } from 'react'
import { useSearchParams } from 'react-router'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { ItemCard } from '@/components/ItemCard'
import { LoadingState } from '@/components/LoadingState'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useItems } from '@/hooks/useItems'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function CatalogPage() {
  useDocumentTitle('Catalog')
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQ = (searchParams.get('q') ?? '').trim()

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
    setSearchParams(q ? { q } : {}, { replace: true })
  })

  useEffect(() => {
    writeQuery(debounced)
  }, [debounced])

  const { data, isPending, isError, error, refetch, isPlaceholderData } =
    useItems(urlQ)

  function clearSearch() {
    setInput('')
    setSearchParams({}, { replace: true })
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

      {isPending ? (
        <LoadingState label="Loading items…" />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data.length === 0 ? (
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
          <p aria-live="polite" className="mb-4 text-sm text-muted-foreground">
            {data.length} {data.length === 1 ? 'item' : 'items'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
