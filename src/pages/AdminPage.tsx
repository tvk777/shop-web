import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router'
import { LoadingState } from '@/components/LoadingState'
import { PageHeader } from '@/components/PageHeader'
import { buttonVariants } from '@/components/ui/button'

const SECTIONS = [
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/items', label: 'Items' },
]

// Small layout loaded eagerly; the sections themselves are lazy chunks (see App.tsx).
export function AdminPage() {
  return (
    <>
      <PageHeader title="Admin" />
      <nav aria-label="Admin sections" className="mb-6 flex gap-2">
        {SECTIONS.map((section) => (
          <NavLink
            key={section.to}
            to={section.to}
            className={({ isActive }) =>
              buttonVariants({ variant: isActive ? 'secondary' : 'ghost' })
            }
          >
            {section.label}
          </NavLink>
        ))}
      </nav>
      <Suspense fallback={<LoadingState />}>
        <Outlet />
      </Suspense>
    </>
  )
}
