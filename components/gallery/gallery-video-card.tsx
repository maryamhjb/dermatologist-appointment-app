import type { LucideIcon } from 'lucide-react'
import { Play } from 'lucide-react'

import type { GalleryVideoItem } from '@/lib/data/gallery-content'
import { cn } from '@/lib/utils'

type GalleryVideoCardProps = {
  item: GalleryVideoItem
  icon: LucideIcon
}

export function GalleryVideoCard({ item, icon: Icon }: GalleryVideoCardProps) {
  return (
    <article
      className={cn(
        'group flex min-h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border/50 bg-muted/15 text-start transition-colors duration-200',
        'hover:bg-muted/25',
      )}
    >
      <a
        href={item.videoUrl}
        className="relative aspect-video w-full shrink-0 cursor-pointer overflow-hidden bg-muted/40 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={`پخش: ${item.title}`}
      >
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <Icon className="size-11 text-muted-foreground/35 transition-colors group-hover:text-muted-foreground/50 sm:size-12" />
        </span>
        <span
          className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors duration-200 group-hover:bg-foreground/4"
          aria-hidden
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-95 transition-all duration-200 group-hover:scale-105 group-hover:opacity-100 sm:size-14">
            <Play className="size-5 translate-x-px fill-current sm:size-6" aria-hidden />
          </span>
        </span>
        <span className="pointer-events-none absolute bottom-2 inset-e-2 rounded-md bg-foreground/80 px-2 py-0.5 text-xs font-medium tabular-nums text-background">
          {item.duration}
        </span>
      </a>
      <div className="flex flex-col gap-1.5 px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
        <h3 className="text-balance text-sm font-semibold leading-snug tracking-tight text-foreground sm:text-base">
          {item.title}
        </h3>
        <p className="text-pretty text-xs leading-relaxed text-muted-foreground sm:text-sm">{item.description}</p>
      </div>
    </article>
  )
}
