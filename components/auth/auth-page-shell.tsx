'use client'

import { SITE_CONTAINER } from '@/lib/layout/site-layout'
import { cn } from '@/lib/utils'

type AuthPageShellProps = {
  children: React.ReactNode
  className?: string
  /** Inner max width; forms stay readable on large screens. */
  innerMaxClass?: string
}

/**
 * Public auth shell: solid background, flat layout aligned with SITE_CONTAINER.
 */
export function AuthPageShell({
  children,
  className,
  innerMaxClass = 'max-w-md',
}: AuthPageShellProps) {
  return (
    <section
      className={cn('relative flex flex-1 flex-col bg-background', className)}
      aria-labelledby="auth-page-heading"
    >
      <div
        className={cn(
          SITE_CONTAINER,
          'relative flex flex-1 flex-col items-center py-10 sm:py-12 md:py-14',
        )}
      >
        <div className={cn('w-full', innerMaxClass)}>{children}</div>
      </div>
    </section>
  )
}
