'use client'

import { cn } from '@/lib/utils'

export function AuthFormServerAlert({
  message,
  className,
}: {
  message: string | null
  className?: string
}) {
  if (!message) return null

  return (
    <div
      role="alert"
      className={cn(
        'w-full rounded-lg border border-destructive/25 bg-destructive/6 px-3 py-2 text-pretty text-start text-[0.625rem] font-medium leading-snug text-destructive dark:bg-destructive/10 sm:text-[0.6875rem]',
        className,
      )}
    >
      {message}
    </div>
  )
}
