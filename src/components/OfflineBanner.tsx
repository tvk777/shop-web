import { useOnlineStatus } from '@/hooks/useOnlineStatus'

// Renders nothing while online, so it takes no space. Sticky and in normal flow:
// while offline it pushes the page down instead of covering the header.
export function OfflineBanner() {
  const isOnline = useOnlineStatus()
  if (isOnline) return null
  return (
    <div
      role="status"
      className="sticky top-0 z-50 bg-destructive px-4 py-2 text-center text-sm text-white"
    >
      You are offline. Data will load when the connection returns.
    </div>
  )
}
