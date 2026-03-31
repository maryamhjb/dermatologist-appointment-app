'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Pricing data for each clinic (prices in million toman)
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
  const [activeTab, setActiveTab] = useState<'tehran' | 'karaj'>('tehran')

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">خدمات و تعرفه‌ها</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'tehran' | 'karaj')} className="w-full">
          <div className="px-6 pt-2">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="tehran">کلینیک تهران</TabsTrigger>
              <TabsTrigger value="karaj">مطب کرج</TabsTrigger>
            </TabsList>
          </div>

          {(['tehran', 'karaj'] as const).map((clinic) => (
            <TabsContent key={clinic} value={clinic} className="mt-0 px-6 py-4">
              <div className="space-y-6">
                {PRICING_DATA[clinic].categories.map((category) => (
                  <div key={category.name}>
                    <h4 className="font-semibold text-primary mb-3 border-b border-border pb-2">
                      {category.name}
                    </h4>
                    <ul className="space-y-2">
                      {category.procedures.map((proc) => (
                        <li
                          key={proc.name}
                          className="flex justify-between items-center py-2 border-b border-border/50 last:border-0"
                        >
                          <span className="text-foreground">{proc.name}</span>
                          <span className="font-semibold text-primary whitespace-nowrap">
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
      </CardContent>
    </Card>
  )
}
