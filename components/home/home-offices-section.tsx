import { CalendarDays, MapPin, Phone } from 'lucide-react'

import { SITE_CONTAINER, SITE_SECTION_Y } from '@/lib/layout/site-layout'
import { cn } from '@/lib/utils'

type Office = {
  name: string
  address: string
  phoneDisplay: string
  phoneHref: string
  days: string
}

const OFFICES: Office[] = [
  {
    name: 'کلینیک تهران',
    address: 'سعادت آباد، بلوار کوهستان، روبه‌روی اوپال، پلاک ۱۱',
    phoneDisplay: '۰۹۳۰۳۰۱۹۱۰۹',
    phoneHref: 'tel:+989303019109',
    days: 'چهارشنبه',
  },
  {
    name: 'مطب کرج',
    address: 'چهارراه طالقانی به سمت میدان شهدا، برج آراد، طبقهٔ هشتم، واحد ۸۰۳',
    phoneDisplay: '۰۹۹۱۱۳۲۰۰۳۰',
    phoneHref: 'tel:+989911320030',
    days: 'شنبه، یکشنبه، سه‌شنبه',
  },
]

function OfficeCard({ office }: { office: Office }) {
  return (
    <article
      className={cn(
        'flex flex-col rounded-lg border border-border/50 bg-muted/15 p-6 text-start transition-colors duration-200',
        'hover:bg-muted/22 sm:p-7',
      )}
    >
      <h3 className="text-lg font-semibold tracking-tight text-foreground">{office.name}</h3>
      <ul className="mt-6 flex flex-col gap-5 sm:mt-7 sm:gap-6">
        <li className="flex items-start gap-3.5">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.65} aria-hidden />
          <p className="min-w-0 text-sm leading-relaxed text-foreground">
            <span className="sr-only">نشانی: </span>
            {office.address}
          </p>
        </li>
        <li className="grid grid-cols-2 items-start gap-4 sm:gap-6">
          <div className="flex min-w-0 items-start gap-3.5">
            <Phone className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.65} aria-hidden />
            <a
              href={office.phoneHref}
              aria-label={`تلفن ${office.phoneDisplay}`}
              className="inline-block text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              dir="ltr"
            >
              {office.phoneDisplay}
            </a>
          </div>
          <div className="flex min-w-0 items-start gap-3.5">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.65} aria-hidden />
            <p className="min-w-0 text-sm leading-relaxed text-foreground">
              <span className="sr-only">روزهای کاری: </span>
              {office.days}
            </p>
          </div>
        </li>
      </ul>
    </article>
  )
}

export function HomeOfficesSection({ className }: { className?: string }) {
  return (
    <section
      id="offices"
      className={cn(SITE_CONTAINER, SITE_SECTION_Y, 'scroll-mt-20', className)}
      aria-labelledby="home-offices-heading"
    >
      <h2
        id="home-offices-heading"
        className="mx-auto mb-7 text-center text-2xl font-bold tracking-tight text-foreground sm:mb-8 sm:text-3xl md:mb-10"
      >
        مطب‌ها
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        {OFFICES.map((office) => (
          <OfficeCard key={office.name} office={office} />
        ))}
      </div>
    </section>
  )
}
