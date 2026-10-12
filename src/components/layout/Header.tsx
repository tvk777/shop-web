import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { Menu } from 'lucide-react'
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
import { cn } from '@/lib/utils'

// Single source of links for the desktop nav and the mobile sheet.
const NAV_ITEMS = [
  { to: '/', label: 'Catalog', end: true },
  { to: '/cart', label: 'Cart' },
  { to: '/orders', label: 'My orders' },
  { to: '/profile', label: 'Profile' },
  { to: '/admin', label: 'Admin', adminOnly: true },
]

// Active link reuses the shadcn button styles, so no custom colors are needed.
function NavLinks({ mobile, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { isAdmin } = useAuth()

  return (
    <>
      {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => (
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
          {/* Step 5: cart item count <Badge> goes here when item.to === '/cart' */}
        </NavLink>
      ))}
    </>
  )
}

export function Header() {
  const { user, logout } = useAuth()
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
        <Link to="/" className="font-semibold">
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
