import { Outlet } from 'react-router'
import { OfflineBanner } from '@/components/OfflineBanner'
import { Header } from './Header'

// Shell for the authenticated routes.
export function AppLayout() {
  return (
    <>
      <OfflineBanner />
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </>
  )
}
