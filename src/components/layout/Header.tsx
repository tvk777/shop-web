import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { Menu } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { homePath } from '@/lib/routes'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  end?: boolean
  // Shown only to this role; without it the link is shown to everyone.
  only?: 'user' | 'admin'
}

// Single source of links for the desktop nav and the mobile sheet.
// An admin gets only Admin and Profile (the API answers 403 to admins on /orders).
const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Catalog', end: true, only: 'user' },
  { to: '/cart', label: 'Cart', only: 'user' },
  { to: '/orders', label: 'My orders', only: 'user' },
  { to: '/admin', label: 'Admin', only: 'admin' },
  { to: '/profile', label: 'Profile' },
]

// Active link reuses the shadcn button styles, so no custom colors are needed.
function NavLinks({ mobile, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { isAdmin } = useAuth()
  const { itemCount } = useCart()
  const role = isAdmin ? 'admin' : 'user'

  return (
    <>
      {NAV_ITEMS.filter((item) => !item.only || item.only === role).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              buttonVariants({
                variant: isActive ? 'secondary' : 'ghost',
                size: mobile ? 'lg' : 'sm',
              }),
              mobile && 'h-10 w-full justify-start',
            )
          }
        >
          {item.label}
          {item.to === '/cart' && itemCount > 0 && (
            <Badge>
              {itemCount}
              <span className="sr-only"> items</span>
            </Badge>
          )}
        </NavLink>
      ))}
    </>
  )
}

export function Header() {
  const { user, isAdmin, logout } = useAuth()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [openedAt, setOpenedAt] = useState(pathname)

  // Close the sheet on any route change (including browser back/forward).
  // Adjusting state during render avoids an effect, which the lint rules discourage.
  if (pathname !== openedAt) {
    setOpenedAt(pathname)
    setOpen(false)
  }

  const close = () => setOpen(false)

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
        <Link to={homePath(isAdmin)} className="font-semibold">
          Shop
        </Link>

        {/* md and up */}
        <div className="hidden flex-1 items-center justify-between gap-4 md:flex">
          <nav className="ml-4 flex gap-1">
            <NavLinks />
          </nav>
          <div className="flex items-center gap-2">
            <span className="text-sm">{user?.first_name}</span>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              Log out
            </Button>
          </div>
        </div>

        {/* below md */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="size-10 md:hidden" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="md:hidden">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              <NavLinks mobile onNavigate={close} />
            </nav>
            <div className="mt-auto flex flex-col gap-2 border-t p-4">
              <span className="text-sm">{user?.first_name}</span>
              <Button
                variant="outline"
                className="h-10 w-full"
                onClick={() => {
                  close()
                  logout()
                }}
              >
                Log out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
