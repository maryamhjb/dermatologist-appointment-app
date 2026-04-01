import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-start">
      <a
        href="#main-content"
        className="fixed inset-s-4 top-4 z-100 -translate-y-24 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-0 shadow-md transition focus:translate-y-0 focus:opacity-100"
      >
        پرش به محتوا
      </a>
      <SiteHeader />
      <main id="main-content" className="flex flex-1 flex-col outline-none" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
