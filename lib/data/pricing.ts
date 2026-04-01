export const PRICING_DATA = {
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
} as const

export type ClinicKey = keyof typeof PRICING_DATA

function toFarsiNumber(num: number): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return num.toString().replace(/\d/g, (d) => farsiDigits[parseInt(d, 10)])
}

export function formatPrice(price: number): string {
  if (price < 1) {
    return toFarsiNumber(price * 1000) + ' هزار'
  }
  return toFarsiNumber(price) + ' میلیون'
}
