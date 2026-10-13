import { useEffect } from 'react'

// Sets "<title> - Shop" while the page is mounted and restores the previous title after.
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} - Shop`
    return () => {
      document.title = previous
    }
  }, [title])
}
