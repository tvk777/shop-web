// Only a plain positive whole number is a page. Anything else in ?page= (0, -1, abc, 1.5,
// 1e3, a number too big to be exact) means page 1, so it is never sent to the API.
export function parsePage(raw: string | null): number {
  if (raw === null || !/^\d+$/.test(raw)) return 1
  const page = Number(raw)
  return Number.isSafeInteger(page) && page >= 1 ? page : 1
}

// The last existing page when `page` is past the end. total_pages is at least 1 in the API,
// the max() only guards against a 0.
export function clampPage(page: number, totalPages: number): number {
  return Math.min(page, Math.max(totalPages, 1))
}

// A copy of the search params with ?page= set. Page 1 is the default and is not written,
// so /orders and /orders?page=1 are the same URL. Other params (q) are kept.
export function withPage(params: URLSearchParams, page: number): URLSearchParams {
  const next = new URLSearchParams(params)
  if (page > 1) next.set('page', String(page))
  else next.delete('page')
  return next
}
