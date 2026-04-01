'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { SITE_CONTAINER } from '@/lib/layout/site-layout'
import { PUBLIC_AUTH_LINK, PUBLIC_DASHBOARD_LINK, PUBLIC_MAIN_NAV } from '@/lib/navigation/public-nav'
import { createClient } from '@/lib/supabase/client'

function useActivePath() {
  const pathname = usePathname()
  return (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

function DesktopNavLink({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-foreground/85 hover:bg-muted/70 hover:text-foreground',
      )}
    >
      {label}
    </Link>
  )
}

function DesktopAuthLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex min-h-10 items-center justify-center rounded-lg border px-4 text-sm font-semibold transition-colors',
        active
          ? 'border-primary/35 bg-primary/10 text-primary'
          : 'border-primary/20 bg-background text-primary hover:border-primary/30 hover:bg-primary/5',
      )}
    >
      {label}
    </Link>
  )
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState<boolean | undefined>(undefined)
  const isActive = useActivePath()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setLoggedIn(!!session?.user))
    return () => subscription.unsubscribe()
  }, [])

  const authHref = loggedIn ? PUBLIC_DASHBOARD_LINK.href : PUBLIC_AUTH_LINK.href
  const authLabel = loggedIn ? PUBLIC_DASHBOARD_LINK.label : PUBLIC_AUTH_LINK.label
  const authShortLabel = loggedIn ? PUBLIC_DASHBOARD_LINK.shortLabel : PUBLIC_AUTH_LINK.shortLabel

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background text-start">
      <div
        className={cn(
          SITE_CONTAINER,
          'flex min-h-14 items-center justify-between gap-3 py-2.5 md:min-h-16 md:gap-4 md:py-3',
        )}
      >
        <Logo href="/" showText className="min-w-0 shrink" />

        <nav className="hidden items-center gap-1 md:flex" aria-label="ناوبری اصلی">
          {PUBLIC_MAIN_NAV.map((item) => (
            <DesktopNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={isActive(item.href)}
            />
          ))}
          <span className="mx-1 hidden h-6 w-px bg-border/80 lg:block" aria-hidden />
          {loggedIn === undefined ? (
            <span
              className="inline-flex min-h-10 min-w-22 items-center justify-center rounded-lg border border-transparent bg-muted/40 px-4"
              aria-hidden
            />
          ) : (
            <DesktopAuthLink
              href={authHref}
              label={authLabel}
              active={loggedIn ? isActive(PUBLIC_DASHBOARD_LINK.href) : isActive(PUBLIC_AUTH_LINK.href)}
            />
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {loggedIn === undefined ? (
            <span className="h-10 w-18 shrink-0 rounded-lg bg-muted/40" aria-hidden />
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-10 shrink-0 rounded-lg border-primary/20 px-4 text-sm font-semibold text-primary hover:bg-primary/5"
              asChild
            >
              <Link href={authHref}>{authShortLabel}</Link>
            </Button>
          )}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  'size-10 shrink-0 rounded-lg border-primary/20 bg-background text-primary',
                  'hover:bg-primary/5 hover:text-primary',
                  // Safari: default focus outline reads as a harsh black ring; use primary ring only on keyboard focus.
                  'outline-none [-webkit-tap-highlight-color:transparent]',
                  'focus-visible:border-primary/30 focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                )}
                aria-expanded={menuOpen}
                aria-controls="site-mobile-nav"
                aria-label="باز کردن منو"
              >
                <Menu className="size-4" strokeWidth={2} aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[min(100%,22rem)] flex-col gap-0 rounded-s-lg border-border/60 p-0"
            >
              <SheetHeader className="border-b border-border/60 px-5 pb-4 pt-6 text-start">
                <SheetTitle className="text-start text-base font-semibold tracking-tight">منوی سایت</SheetTitle>
                <p className="text-start text-sm font-normal text-muted-foreground">
                  صفحات اصلی
                  {loggedIn === undefined ? '' : loggedIn ? ' و داشبورد' : ' و ورود'}
                </p>
              </SheetHeader>
              <nav
                id="site-mobile-nav"
                className="flex flex-1 flex-col gap-2 px-4 py-5"
                aria-label="ناوبری اصلی"
              >
                {PUBLIC_MAIN_NAV.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex min-h-12 items-center rounded-xl px-4 text-sm font-medium transition-colors',
                        isActive(item.href)
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-muted/80',
                      )}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
                <div className="my-2 border-t border-border/60" />
                {loggedIn === undefined ? (
                  <div
                    className="flex min-h-12 items-center justify-center rounded-xl bg-muted/50 px-4"
                    aria-hidden
                  />
                ) : (
                  <SheetClose asChild>
                    <Link
                      href={authHref}
                      className="flex min-h-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/5 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                    >
                      {authLabel}
                    </Link>
                  </SheetClose>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
