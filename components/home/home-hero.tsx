'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookingDialog } from '@/components/booking-dialog'
import { HeroLogo } from '@/components/home/hero-logo'
import { SITE_CONTAINER, SITE_HERO_Y } from '@/lib/layout/site-layout'
import {
  SITE_DOCTOR_FAMILY_NAME,
  SITE_TITLE_DOCTOR_SHORT,
  SITE_TITLE_SPECIALTY,
} from '@/lib/site-brand'
import { cn } from '@/lib/utils'

const metaPill =
  'inline-flex w-full max-w-full items-center justify-center rounded-full border border-border bg-muted/35 px-3 py-2 text-center text-xs leading-snug text-foreground sm:px-3.5 sm:py-1.5 sm:text-[0.8125rem]'

export function HomeHero({ className }: { className?: string }) {
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <section
      className={cn('relative isolate overflow-hidden bg-background', className)}
      aria-labelledby="home-hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,oklch(0.35_0.13_22/0.04)_0%,transparent_40%)] dark:bg-[linear-gradient(180deg,oklch(0.48_0.11_22/0.06)_0%,transparent_42%)]"
        aria-hidden
      />

      <div className={cn(SITE_CONTAINER, SITE_HERO_Y)}>
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center md:max-w-4xl">
          <div className="flex w-full flex-col items-center gap-12 sm:gap-14 md:gap-16">
            <HeroLogo />

            <h1
              id="home-hero-heading"
              className="flex w-full flex-col items-center gap-7 text-balance sm:gap-9 md:gap-11"
            >
              {/* Same hierarchy as navbar wordmark: specialty (small) → name row (primary + gold) */}
              <span className="text-sm font-semibold leading-snug text-primary sm:text-base md:text-lg">
                {SITE_TITLE_SPECIALTY}
              </span>
              <span className="flex flex-wrap items-baseline justify-center gap-x-2 sm:gap-x-2.5 md:gap-x-3">
                <span className="text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl md:text-5xl">
                  {SITE_TITLE_DOCTOR_SHORT}
                </span>
                <span className="text-3xl font-bold leading-tight tracking-tight text-brand-gold-bright [-webkit-text-stroke:0.6px_var(--color-primary)] [paint-order:stroke_fill] sm:text-4xl md:text-5xl">
                  {SITE_DOCTOR_FAMILY_NAME}
                </span>
              </span>
              <span className="text-xl font-semibold leading-snug text-primary sm:text-2xl md:text-3xl">
                رزرو آنلاین · تهران و کرج
              </span>
            </h1>

            <div className="flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
              <Button
                type="button"
                size="lg"
                className="h-12 min-h-12 w-full rounded-lg bg-primary px-8 text-base font-semibold sm:w-auto sm:min-w-44"
                onClick={() => setBookingOpen(true)}
              >
                رزرو نوبت
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 min-h-12 w-full rounded-lg border-border bg-background px-8 text-base text-foreground hover:bg-muted/50 sm:w-auto"
                asChild
              >
                <Link href="#offices">مشاهده مطب‌ها</Link>
              </Button>
            </div>

            <ul
              className="grid w-full max-w-lg grid-cols-2 gap-2.5 sm:max-w-2xl sm:grid-cols-3 sm:gap-3 md:max-w-3xl md:gap-3.5"
              aria-label="خلاصه دسترسی"
            >
              <li className={metaPill}>تهران · چهارشنبه</li>
              <li className={metaPill}>کرج · شنبه، یکشنبه، سه‌شنبه</li>
              <li className={cn(metaPill, 'col-span-2 justify-self-center sm:col-span-1 sm:justify-self-auto')}>
                رزرو آنلاین ۲۴ ساعته
              </li>
            </ul>
          </div>
        </div>
      </div>

      <BookingDialog open={bookingOpen} onOpenChange={setBookingOpen} />
    </section>
  )
}
