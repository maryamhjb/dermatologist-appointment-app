import Link from 'next/link'

import { LogoFramedMark } from '@/components/logo-framed-mark'
import {
  SITE_DOCTOR_FAMILY_NAME,
  SITE_TITLE,
  SITE_TITLE_DOCTOR_SHORT,
  SITE_TITLE_SPECIALTY,
} from '@/lib/site-brand'
import { cn } from '@/lib/utils'

interface LogoProps {
  href?: string
  showText?: boolean
  className?: string
}

export function Logo({ href = '/', showText = true, className }: LogoProps) {
  const content = (
    <div className={cn('flex items-center gap-2.5 text-start md:gap-3', className)}>
      <LogoFramedMark variant="header" />
      {showText ? (
        <span className="flex min-w-0 max-w-[min(100%,15rem)] flex-col gap-1 text-start sm:max-w-[18rem] md:max-w-88">
          <span
            className={cn(
              'line-clamp-2 text-[0.5625rem] font-semibold leading-snug sm:line-clamp-1 sm:text-[0.6875rem] md:text-[0.71rem]',
              'text-primary',
            )}
          >
            {SITE_TITLE_SPECIALTY}
          </span>
          <span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-sm font-bold leading-tight tracking-tight sm:text-base md:text-lg">
            <span className="shrink-0 text-primary">{SITE_TITLE_DOCTOR_SHORT}</span>
            <span
              className={cn(
                'shrink-0 text-[0.6rem] font-semibold sm:text-[0.6875rem] md:text-xs',
                'text-brand-gold-bright',
              )}
            >
              {SITE_DOCTOR_FAMILY_NAME}
            </span>
          </span>
        </span>
      ) : null}
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`${SITE_TITLE} — خانه`}
        className="rounded-xl outline-offset-2 transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {content}
      </Link>
    )
  }

  return content
}
