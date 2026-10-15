import { lazy } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { RedirectIfAuthenticated } from '@/components/RedirectIfAuthenticated'
import { RequireAdmin } from '@/components/RequireAdmin'
import { RequireAuth } from '@/components/RequireAuth'
import { RequireUser } from '@/components/RequireUser'
import { AdminPage } from '@/pages/AdminPage'
import { CartPage } from '@/pages/CartPage'
import { CatalogPage } from '@/pages/CatalogPage'
import { LoginPage } from '@/pages/LoginPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { RouteError } from '@/pages/RouteError'
import { SignupPage } from '@/pages/SignupPage'

// Admin sections are separate chunks, so regular users never download them.
// AdminPage renders the Suspense boundary around them.
const AdminUsersPage = lazy(() =>
  import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })),
)
const AdminItemsPage = lazy(() =>
  import('@/pages/admin/AdminItemsPage').then((m) => ({ default: m.AdminItemsPage })),
)

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <RouteError />,
    children: [
      {
        element: <RedirectIfAuthenticated />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/signup', element: <SignupPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireAuth />,
    errorElement: <RouteError />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            element: <RequireUser />,
            children: [
              { path: '/', element: <CatalogPage /> },
              { path: '/cart', element: <CartPage /> },
              { path: '/orders', element: <OrdersPage /> },
            ],
          },
          { path: '/profile', element: <ProfilePage /> },
          {
            element: <RequireAdmin />,
            children: [
              {
                path: '/admin',
                element: <AdminPage />,
                children: [
                  { index: true, element: <Navigate to="users" replace /> },
                  { path: 'users', element: <AdminUsersPage /> },
                  { path: 'items', element: <AdminItemsPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
