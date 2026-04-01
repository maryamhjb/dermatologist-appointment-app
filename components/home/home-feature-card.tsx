import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

type HomeFeatureCardProps = {
  icon: LucideIcon
  title: string
  description: string
  /** Tighter type scale — for dense marketing grids (2×2 / 4-up). */
  compact?: boolean
  className?: string
}

export function HomeFeatureCard({
  icon: Icon,
  title,
  description,
  compact = false,
  className,
}: HomeFeatureCardProps) {
  return (
    <article
      className={cn(
        'group relative flex min-h-full min-w-0 flex-col items-center text-center',
        'justify-start rounded-lg border border-border/50 bg-muted/15 transition-colors duration-200',
        'hover:bg-muted/25',
        compact
          ? 'gap-3.5 p-4 sm:gap-4 sm:p-5 md:p-5 lg:gap-4 lg:p-6'
          : 'gap-5 rounded-lg border border-border/50 p-6 sm:p-7',
        className,
      )}
    >
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg text-primary transition-colors',
          'bg-primary/6 group-hover:bg-primary/9',
          compact ? 'size-10 sm:size-11' : 'size-12 sm:size-14',
        )}
        aria-hidden
      >
        <Icon
          className={compact ? 'size-4.5 sm:size-5' : 'size-6'}
          strokeWidth={1.65}
        />
      </div>
      <div className="flex w-full min-w-0 flex-col items-center gap-2 sm:gap-2.5">
        <h3
          className={cn(
            'w-full text-balance font-semibold leading-snug tracking-tight text-foreground',
            compact
              ? 'text-[0.8125rem] sm:text-sm md:text-[0.9375rem]'
              : 'text-base sm:text-lg',
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            'w-full text-pretty text-muted-foreground',
            compact
              ? 'text-[0.6875rem] leading-relaxed sm:text-xs md:text-[0.8125rem] md:leading-relaxed'
              : 'text-sm leading-relaxed sm:text-base',
          )}
        >
          {description}
        </p>
      </div>
    </article>
  )
}
