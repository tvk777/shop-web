import { useCallback, useEffect, useEffectEvent } from 'react'
import { useSearchParams } from 'react-router'
import type { PaginationMeta } from '@/api/types'
import { clampPage, parsePage, withPage } from '@/lib/pagination'

export type SetPage = (page: number, options?: { replace?: boolean }) => void

// The current page lives in ?page=, so reload and the back button keep it.
// setPage pushes by default: Back returns to the previous page.
export function usePageParam() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePage(searchParams.get('page'))
  // Functional update: works from the current URL, so ?q= is kept.
  const setPage = useCallback<SetPage>(
    (next, options) => setSearchParams((prev) => withPage(prev, next), options),
    [setSearchParams],
  )
  return { page, setPage }
}

// Sends a page past the end (a stale ?page=, or the last row of the last page deleted) to
// the last page. Pass meta only when it belongs to `page` (not placeholder data).
// Returns true while the page is out of range, so the caller can show a loading state
// instead of an empty list. This effect syncs the URL; it does not fetch anything.
export function useClampPage(page: number, meta: PaginationMeta | undefined, setPage: SetPage) {
  const totalPages = meta?.total_pages
  const outOfRange = totalPages !== undefined && page > totalPages

  // replace: the out-of-range URL should not be reachable with Back.
  const clamp = useEffectEvent((total: number) => setPage(clampPage(page, total), { replace: true }))

  useEffect(() => {
    if (outOfRange) clamp(totalPages)
  }, [outOfRange, totalPages])

  return outOfRange
}
