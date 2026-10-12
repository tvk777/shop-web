import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { RedirectIfAuthenticated } from '@/components/RedirectIfAuthenticated'
import { RequireAdmin } from '@/components/RequireAdmin'
import { RequireAuth } from '@/components/RequireAuth'
import { AdminPage } from '@/pages/AdminPage'
import { CartPage } from '@/pages/CartPage'
import { CatalogPage } from '@/pages/CatalogPage'
import { LoginPage } from '@/pages/LoginPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SignupPage } from '@/pages/SignupPage'

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
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
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <CatalogPage /> },
          { path: '/cart', element: <CartPage /> },
          { path: '/orders', element: <OrdersPage /> },
          { path: '/profile', element: <ProfilePage /> },
          {
            element: <RequireAdmin />,
            children: [{ path: '/admin', element: <AdminPage /> }],
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
