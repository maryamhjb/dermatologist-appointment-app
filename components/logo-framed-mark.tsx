import Image from 'next/image'

import { cn } from '@/lib/utils'

/**
 * 1px rim: clear burgundy tint (oklch) so it doesn’t read as pale pink on cream.
 */
const RING =
  'relative rounded-full p-px bg-[linear-gradient(145deg,oklch(0.35_0.13_22/0.34),oklch(0.35_0.13_22/0.16),oklch(0.35_0.13_22/0.07))]'

const INNER =
  'rounded-full bg-background/95 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.22)]'

/** Burgundy radial behind the mark: strongest at center, dissolves toward the edges (center → out). */
const WASH_HEADER =
  'pointer-events-none absolute left-1/2 top-1/2 z-0 size-[4.75rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,oklch(0.35_0.13_22/0.2)_0%,oklch(0.35_0.13_22/0.09)_32%,oklch(0.35_0.13_22/0.03)_50%,transparent_72%)] blur-[10px] md:size-[5.25rem]'

const WASH_HERO =
  'pointer-events-none absolute left-1/2 top-1/2 z-0 h-[15rem] w-[15rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,oklch(0.35_0.13_22/0.16)_0%,oklch(0.35_0.13_22/0.065)_30%,oklch(0.35_0.13_22/0.02)_48%,transparent_68%)] blur-[26px] sm:h-[18rem] sm:w-[18rem] sm:blur-[32px] md:h-[20rem] md:w-[20rem] md:blur-[36px]'

type LogoFramedMarkProps = {
  /** `header`: nav scale. `hero`: home hero scale. */
  variant: 'header' | 'hero'
  className?: string
}

/**
 * Burgundy wash (center-out) behind the disc + hairline rim + cream inner + `/logo.png`.
 * `Image` uses `fill` inside a fixed `size-*` box.
 */
export function LogoFramedMark({ variant, className }: LogoFramedMarkProps) {
  const isHero = variant === 'hero'

  return (
    <div className={cn('relative flex shrink-0 justify-center', className)} aria-hidden>
      <div className={isHero ? WASH_HERO : WASH_HEADER} />
      <div
        className={cn(
          RING,
          'relative z-1',
          isHero
            ? 'shadow-[0_2px_14px_-6px_oklch(0.35_0.13_22/0.06)]'
            : 'shadow-[0_1px_10px_-5px_oklch(0.35_0.13_22/0.05)]',
        )}
      >
        <div className={cn(INNER, isHero ? 'p-2 sm:p-2.5 md:p-3' : 'p-1 md:p-1.5')}>
          <div
            className={cn(
              'relative',
              isHero ? 'size-21 sm:size-28 md:size-30' : 'size-9 md:size-10',
            )}
          >
            <Image
              src="/logo.png"
              alt=""
              fill
              className={cn(
                'object-contain object-center',
                isHero ? '' : 'contrast-[1.1] saturate-[1.12] drop-shadow-[0_1px_2px_oklch(0.35_0.11_22/0.12)]',
              )}
              sizes={isHero ? '(min-width: 768px) 120px, (min-width: 640px) 112px, 88px' : '(min-width: 768px) 40px, 36px'}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
