'use client'

import Link from 'next/link'

import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type PortalHeaderProps = {
  onLogout: () => void
  /** Tailwind max-width for inner bar (match page content width) */
  maxWidthClass?: string
}

/**
 * Sticky top bar for logged-in areas (patient dashboard, admin). RTL-friendly; links stay in-app.
 */
export function PortalHeader({ onLogout, maxWidthClass = 'max-w-4xl' }: PortalHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background text-start">
      <div className={cn('mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3', maxWidthClass)}>
        <Logo href="/" showText className="min-w-0 shrink" />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">صفحه اصلی</Link>
          </Button>
          <Button variant="outline" size="sm" type="button" onClick={onLogout}>
            خروج
          </Button>
        </div>
      </div>
    </header>
  )
}
