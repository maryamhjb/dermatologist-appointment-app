'use client'

import { useState, useRef, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'

const PRICING_DATA = {
  tehran: {
    label: 'کلینیک تهران',
    categories: [
      {
        name: 'خدمات پوست',
        procedures: [
          { name: 'ویزیت و مشاوره', price: 0.5 },
          { name: 'میکرونیدلینگ', price: 2.5 },
          { name: 'لیزر موهای زائد (صورت)', price: 1.5 },
          { name: 'لیزر موهای زائد (بدن)', price: 3.0 },
          { name: 'پاکسازی پوست', price: 1.2 },
          { name: 'هایفوتراپی', price: 8.0 },
        ],
      },
      {
        name: 'تزریقات',
        procedures: [
          { name: 'بوتاکس (پیشانی)', price: 3.5 },
          { name: 'بوتاکس (دور چشم)', price: 2.5 },
          { name: 'فیلر لب', price: 4.0 },
          { name: 'فیلر گونه', price: 5.0 },
          { name: 'مزوتراپی صورت', price: 2.0 },
          { name: 'مزوتراپی مو', price: 2.5 },
        ],
      },
      {
        name: 'درمان‌های تخصصی',
        procedures: [
          { name: 'درمان آکنه', price: 1.8 },
          { name: 'درمان لک و پیگمانتاسیون', price: 2.2 },
          { name: 'جوانسازی با PRP', price: 3.5 },
          { name: 'لیفت با نخ', price: 12.0 },
        ],
      },
    ],
  },
  karaj: {
    label: 'مطب کرج',
    categories: [
      {
        name: 'خدمات پوست',
        procedures: [
          { name: 'ویزیت و مشاوره', price: 0.4 },
          { name: 'میکرونیدلینگ', price: 2.0 },
          { name: 'لیزر موهای زائد (صورت)', price: 1.2 },
          { name: 'لیزر موهای زائد (بدن)', price: 2.5 },
          { name: 'پاکسازی پوست', price: 1.0 },
          { name: 'هایفوتراپی', price: 7.0 },
        ],
      },
      {
        name: 'تزریقات',
        procedures: [
          { name: 'بوتاکس (پیشانی)', price: 3.0 },
          { name: 'بوتاکس (دور چشم)', price: 2.0 },
          { name: 'فیلر لب', price: 3.5 },
          { name: 'فیلر گونه', price: 4.5 },
          { name: 'مزوتراپی صورت', price: 1.8 },
          { name: 'مزوتراپی مو', price: 2.2 },
        ],
      },
      {
        name: 'درمان‌های تخصصی',
        procedures: [
          { name: 'درمان آکنه', price: 1.5 },
          { name: 'درمان لک و پیگمانتاسیون', price: 1.8 },
          { name: 'جوانسازی با PRP', price: 3.0 },
          { name: 'لیفت با نخ', price: 10.0 },
        ],
      },
    ],
  },
}

function toFarsiNumber(num: number): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return num.toString().replace(/\d/g, (d) => farsiDigits[parseInt(d)])
}

function formatPrice(price: number): string {
  if (price < 1) {
    return toFarsiNumber(price * 1000) + ' هزار'
  }
  return toFarsiNumber(price) + ' میلیون'
}

export function PricingTabs() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'tehran' | 'karaj'>('tehran')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger card — always visible */}
      <Card
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOpen((v) => !v)}
        className="cursor-pointer select-none hover:border-primary/40 transition-colors"
      >
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-xl">خدمات متنوع</CardTitle>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </CardHeader>
        <div className="px-6 pb-6 text-sm text-muted-foreground text-center leading-relaxed">
          انواع خدمات درماتولوژی و زیبایی با قیمت‌های مشخص
        </div>
      </Card>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 top-full mt-2 right-0 left-0 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'tehran' | 'karaj')} className="w-full">
            <div className="px-4 pt-4">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="tehran">کلینیک تهران</TabsTrigger>
                <TabsTrigger value="karaj">مطب کرج</TabsTrigger>
              </TabsList>
            </div>

            {(['tehran', 'karaj'] as const).map((clinic) => (
              <TabsContent key={clinic} value={clinic} className="mt-0 px-4 py-4 max-h-96 overflow-y-auto">
                <div className="space-y-5">
                  {PRICING_DATA[clinic].categories.map((category) => (
                    <div key={category.name}>
                      <h4 className="font-semibold text-primary mb-2 border-b border-border pb-2">
                        {category.name}
                      </h4>
                      <ul className="space-y-1">
                        {category.procedures.map((proc) => (
                          <li
                            key={proc.name}
                            className="flex justify-between items-center py-2 border-b border-border/40 last:border-0"
                          >
                            <span className="text-foreground text-sm">{proc.name}</span>
                            <span className="font-semibold text-primary text-sm whitespace-nowrap">
                              {formatPrice(proc.price)} تومان
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  )
}
