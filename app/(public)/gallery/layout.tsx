import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'گالری',
  description: 'نمونه کار، ویدیوهای آموزشی پوست و راهنمای استفاده از سایت',
}

export default function GallerySegmentLayout({ children }: { children: React.ReactNode }) {
  return children
}
