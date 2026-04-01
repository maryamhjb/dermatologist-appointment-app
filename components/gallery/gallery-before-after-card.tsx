'use client'

import { useCallback, useState } from 'react'
import { ImageIcon } from 'lucide-react'

import type { BeforeAfterItem } from '@/lib/data/gallery-content'
import { cn } from '@/lib/utils'

type GalleryBeforeAfterCardProps = {
  item: BeforeAfterItem
}

export function GalleryBeforeAfterCard({ item }: GalleryBeforeAfterCardProps) {
  const [showAfter, setShowAfter] = useState(false)

  const toggle = useCallback(() => setShowAfter((v) => !v), [])
  const showBefore = useCallback(() => setShowAfter(false), [])
  const showAfterView = useCallback(() => setShowAfter(true), [])

  return (
    <article
      className={cn(
        'flex min-h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border/50 bg-muted/15 text-start transition-colors duration-200',
        'hover:bg-muted/25',
      )}
    >
      <button
        type="button"
        onClick={toggle}
        onMouseEnter={showAfterView}
        onMouseLeave={showBefore}
        aria-pressed={showAfter}
        aria-label={`${item.title} — ${showAfter ? 'نمایش قبل از درمان' : 'نمایش بعد از درمان'}`}
        className="relative aspect-4/3 w-full shrink-0 cursor-pointer overflow-hidden text-start outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-opacity duration-300',
            showAfter ? 'pointer-events-none opacity-0' : 'opacity-100',
          )}
          aria-hidden
        >
          <span className="flex items-center gap-3 p-4">
            <ImageIcon className="size-9 shrink-0 text-muted-foreground/45" />
            <span className="text-sm text-muted-foreground">قبل از درمان</span>
          </span>
        </span>
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-primary/6 transition-opacity duration-300',
            showAfter ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          aria-hidden
        >
          <span className="flex items-center gap-3 p-4">
            <ImageIcon className="size-9 shrink-0 text-primary/55" />
            <span className="text-sm font-medium text-primary">بعد از درمان</span>
          </span>
        </span>
        <span className="pointer-events-none absolute inset-s-2 top-2 rounded-md border border-border/40 bg-background px-2 py-1 text-xs font-medium text-foreground">
          {showAfter ? 'بعد' : 'قبل'}
        </span>
      </button>
      <div className="flex flex-col gap-1.5 px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
        <h3 className="text-balance text-sm font-semibold leading-snug tracking-tight text-foreground sm:text-base">
          {item.title}
        </h3>
        <p className="text-pretty text-xs leading-relaxed text-muted-foreground sm:text-sm">{item.description}</p>
      </div>
    </article>
  )
}
