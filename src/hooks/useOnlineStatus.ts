import { onlineManager } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

// TanStack Query already tracks the browser's online/offline events: reuse its state,
// so the banner and paused queries always agree.
export function useOnlineStatus() {
  return useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
  )
}
