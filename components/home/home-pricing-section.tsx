'use client'

import { useId, useState } from 'react'
import { ListOrdered } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatPrice, PRICING_DATA, type ClinicKey } from '@/lib/data/pricing'
import { MARKETING_TAB_TRIGGER_CLASS } from '@/lib/ui/marketing-tab-trigger'
import { cn } from '@/lib/utils'

function PriceToggle({
  price,
  serviceLabel,
  instanceId,
}: {
  price: number
  serviceLabel: string
  instanceId: string
}) {
  const [visible, setVisible] = useState(false)
  const priceId = `${instanceId}-amount`

  return (
    <div className="flex shrink-0 items-center gap-2">
      <span
        id={priceId}
        className={cn(
          'whitespace-nowrap text-xs font-semibold tabular-nums text-primary sm:text-sm',
          !visible && 'sr-only',
        )}
        aria-live="polite"
      >
        {formatPrice(price)} تومان
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 min-h-8 shrink-0 touch-manipulation rounded-md px-2.5 text-xs font-medium text-primary hover:bg-primary/8 sm:px-3"
        aria-expanded={visible}
        aria-controls={priceId}
        aria-label={visible ? `پنهان کردن قیمت ${serviceLabel}` : `مشاهده قیمت ${serviceLabel}`}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? 'پنهان' : 'مشاهده قیمت'}
      </Button>
    </div>
  )
}

function ClinicPanel({ clinic }: { clinic: ClinicKey }) {
  const baseId = useId()
  const data = PRICING_DATA[clinic]

  return (
    <div className="px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
      <div className="space-y-6 sm:space-y-7">
        {data.categories.map((category, ci) => (
          <section key={category.name} aria-labelledby={`${baseId}-${clinic}-${ci}-h`}>
            <h3
              id={`${baseId}-${clinic}-${ci}-h`}
              className="mb-3 text-sm font-semibold text-primary sm:mb-3.5"
            >
              {category.name}
            </h3>
            <ul className="grid grid-cols-1 gap-x-8 gap-y-0 md:grid-cols-2 md:gap-x-10 lg:gap-x-12">
              {category.procedures.map((proc, pi) => {
                const rowKey = `${clinic}-${ci}-${pi}`
                return (
                  <li
                    key={proc.name}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-md py-2.5 text-start hover:bg-muted/20 md:min-h-10 md:py-2"
                  >
                    <span className="min-w-0 flex-1 text-pretty text-sm leading-snug text-foreground">
                      {proc.name}
                    </span>
                    <PriceToggle
                      price={proc.price}
                      serviceLabel={proc.name}
                      instanceId={`${baseId}-${rowKey}`}
                    />
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

export function HomePricingSection({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-muted/20 text-start',
        className,
      )}
      aria-labelledby="home-pricing-heading"
    >
      <Tabs defaultValue="tehran" className="w-full">
        <div className="border-b border-border/40 px-4 pb-4 pt-4 sm:px-6 sm:pb-5 sm:pt-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/7 text-primary sm:h-10 sm:w-10"
              aria-hidden
            >
              <ListOrdered className="size-4 sm:size-4.5" strokeWidth={1.65} />
            </div>
            <h2
              id="home-pricing-heading"
              className="min-w-0 flex-1 pt-0.5 text-base font-semibold tracking-tight text-foreground sm:text-lg"
            >
              خدمات و تعرفه‌ها
            </h2>
          </div>
          <div className="mt-4 sm:mt-5">
            <TabsList
              className="grid h-auto w-full grid-cols-2 gap-3 bg-transparent p-0 sm:mx-auto sm:max-w-xl"
              aria-label="انتخاب مطب برای تعرفه"
            >
              <TabsTrigger value="tehran" className={MARKETING_TAB_TRIGGER_CLASS}>
                {PRICING_DATA.tehran.label}
              </TabsTrigger>
              <TabsTrigger value="karaj" className={MARKETING_TAB_TRIGGER_CLASS}>
                {PRICING_DATA.karaj.label}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="tehran" className="mt-0 focus-visible:outline-none">
          <ClinicPanel clinic="tehran" />
        </TabsContent>
        <TabsContent value="karaj" className="mt-0 focus-visible:outline-none">
          <ClinicPanel clinic="karaj" />
        </TabsContent>
      </Tabs>
    </section>
  )
}
