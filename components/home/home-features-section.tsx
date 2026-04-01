import { CalendarClock, Headphones, MapPinned, Star } from 'lucide-react'

import { HomeFeatureCard } from '@/components/home/home-feature-card'
import { HomePricingSection } from '@/components/home/home-pricing-section'
import { SITE_CONTAINER, SITE_SECTION_Y } from '@/lib/layout/site-layout'
import { cn } from '@/lib/utils'

const FEATURES = [
  {
    icon: CalendarClock,
    title: 'رزرو و پیگیری نوبت',
    description: 'رزرو نوبت و پیگیری وضعیت آن به صورت آنلاین',
  },
  {
    icon: Star,
    title: 'امتیاز و تخفیف',
    description: 'امتیاز از بازخوردها و استفاده در هنگام پرداخت در مطب.',
  },
  {
    icon: MapPinned,
    title: 'تهران و کرج',
    description: 'دو مطب فعال؛ برنامهٔ تهران و کرج روی سایت درج شده است.',
  },
  {
    icon: Headphones,
    title: 'پشتیبانی',
    description: 'سؤالات از مسیر سایت یا تماس مستقیم با مطب.',
  },
] as const

export function HomeFeaturesSection({ className }: { className?: string }) {
  return (
    <section className={cn(SITE_CONTAINER, SITE_SECTION_Y, className)} aria-labelledby="home-features-heading">
      <h2
        id="home-features-heading"
        className="mx-auto mb-7 max-w-xl text-balance text-center text-xl font-bold tracking-tight text-foreground sm:mb-8 sm:text-2xl md:mb-9 md:text-[1.65rem]"
      >
        رزرو نوبت و پیگیری 
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-5">
        {FEATURES.map((f) => (
          <HomeFeatureCard
            key={f.title}
            icon={f.icon}
            title={f.title}
            description={f.description}
            compact
          />
        ))}
      </div>

      <div className="mt-5 sm:mt-6">
        <HomePricingSection />
      </div>
    </section>
  )
}
