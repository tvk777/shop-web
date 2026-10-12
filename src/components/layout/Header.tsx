import { Link, NavLink } from 'react-router'
import { Button, buttonVariants } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

// Active link reuses the shadcn button styles, so no custom colors are needed.
function navLinkClass({ isActive }: { isActive: boolean }) {
  return buttonVariants({ variant: isActive ? 'secondary' : 'ghost', size: 'sm' })
}

export function Header() {
  const { user, isAdmin, logout } = useAuth()

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link to="/" className="font-semibold">
            Shop
          </Link>
          <nav className="flex flex-wrap gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Catalog
            </NavLink>
            <NavLink to="/cart" className={navLinkClass}>
              Cart
              {/* Step 5: cart item count <Badge> goes here */}
            </NavLink>
            <NavLink to="/orders" className={navLinkClass}>
              My orders
            </NavLink>
            <NavLink to="/profile" className={navLinkClass}>
              Profile
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass}>
                Admin
              </NavLink>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">{user?.first_name}</span>
          <Button variant="outline" size="sm" onClick={() => logout()}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  )
}
