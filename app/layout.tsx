import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Vazirmatn } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const vazirmatn = Vazirmatn({ subsets: ['latin', 'arabic'] })

export const metadata: Metadata = {
  title: 'مطب درماتولوژی دکتر مریم',
  description: 'سیستم رزرو آنلاین نوبت و خدمات درماتولوژی',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={vazirmatn.className}>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
