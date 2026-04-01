import { SITE_CONTAINER } from '@/lib/layout/site-layout'
import { SITE_TITLE } from '@/lib/site-brand'
import { cn } from '@/lib/utils'

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-background">
      <div className={cn(SITE_CONTAINER, 'py-6 text-center md:py-8')}>
        <p className="text-xs leading-relaxed text-muted-foreground">
          © ۱۴۰۵ {SITE_TITLE}.
          <br className="md:hidden" aria-hidden />
          <span className="hidden md:inline"> </span>
          تمام حقوق محفوظ است.
        </p>
      </div>
    </footer>
  )
}
