'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Logo } from '@/components/logo'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, ImageIcon, Video, BookOpen } from 'lucide-react'

// Sample before/after data - replace with actual images
const beforeAfterItems = [
  {
    id: 1,
    title: 'درمان آکنه',
    description: 'نتیجه درمان آکنه پس از ۳ ماه',
    before: '/placeholder-before-1.jpg',
    after: '/placeholder-after-1.jpg',
  },
  {
    id: 2,
    title: 'جوانسازی پوست',
    description: 'نتیجه لیزر جوانسازی پس از ۴ جلسه',
    before: '/placeholder-before-2.jpg',
    after: '/placeholder-after-2.jpg',
  },
  {
    id: 3,
    title: 'درمان لک',
    description: 'نتیجه درمان لک‌های پوستی',
    before: '/placeholder-before-3.jpg',
    after: '/placeholder-after-3.jpg',
  },
  {
    id: 4,
    title: 'تزریق بوتاکس',
    description: 'نتیجه تزریق بوتاکس پیشانی',
    before: '/placeholder-before-4.jpg',
    after: '/placeholder-after-4.jpg',
  },
]

// Sample educational videos - replace with actual video URLs
const educationalVideos = [
  {
    id: 1,
    title: 'مراقبت روزانه از پوست',
    description: 'آموزش روتین مراقبت صبح و شب',
    thumbnail: '/placeholder-video-1.jpg',
    duration: '۱۲:۳۵',
    videoUrl: '#',
  },
  {
    id: 2,
    title: 'انتخاب ضد آفتاب مناسب',
    description: 'راهنمای انتخاب ضد آفتاب برای انواع پوست',
    thumbnail: '/placeholder-video-2.jpg',
    duration: '۸:۴۵',
    videoUrl: '#',
  },
  {
    id: 3,
    title: 'درمان خانگی آکنه',
    description: 'نکات مهم برای کنترل آکنه در خانه',
    thumbnail: '/placeholder-video-3.jpg',
    duration: '۱۵:۲۰',
    videoUrl: '#',
  },
  {
    id: 4,
    title: 'مراقبت از پوست در زمستان',
    description: 'نکات ویژه برای فصل سرد',
    thumbnail: '/placeholder-video-4.jpg',
    duration: '۱۰:۱۰',
    videoUrl: '#',
  },
]

// Sample tutorial videos
const tutorialVideos = [
  {
    id: 1,
    title: 'نحوه رزرو نوبت آنلاین',
    description: 'آموزش قدم به قدم رزرو نوبت از سایت',
    thumbnail: '/placeholder-tutorial-1.jpg',
    duration: '۳:۲۰',
    videoUrl: '#',
  },
  {
    id: 2,
    title: 'ایجاد حساب کاربری',
    description: 'آموزش ثبت‌نام و ورود به سایت',
    thumbnail: '/placeholder-tutorial-2.jpg',
    duration: '۲:۴۵',
    videoUrl: '#',
  },
  {
    id: 3,
    title: 'مشاهده تاریخچه نوبت‌ها',
    description: 'نحوه دسترسی به نوبت‌های قبلی و آینده',
    thumbnail: '/placeholder-tutorial-3.jpg',
    duration: '۴:۱۵',
    videoUrl: '#',
  },
  {
    id: 4,
    title: 'سیستم امتیازات و تخفیف',
    description: 'آموزش کسب امتیاز و استفاده از تخفیف',
    thumbnail: '/placeholder-tutorial-4.jpg',
    duration: '۵:۳۰',
    videoUrl: '#',
  },
]

function BeforeAfterCard({ item }: { item: typeof beforeAfterItems[0] }) {
  const [showAfter, setShowAfter] = useState(false)

  return (
    <Card className="overflow-hidden group">
      <div 
        className="relative aspect-[4/3] bg-muted cursor-pointer"
        onMouseEnter={() => setShowAfter(true)}
        onMouseLeave={() => setShowAfter(false)}
        onClick={() => setShowAfter(!showAfter)}
      >
        {/* Placeholder for images */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${showAfter ? 'opacity-0' : 'opacity-100'}`}>
          <div className="text-center p-4">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">قبل از درمان</p>
          </div>
        </div>
        <div className={`absolute inset-0 flex items-center justify-center bg-primary/5 transition-opacity duration-300 ${showAfter ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-center p-4">
            <ImageIcon className="w-12 h-12 mx-auto text-primary/50 mb-2" />
            <p className="text-sm text-primary">بعد از درمان</p>
          </div>
        </div>
        {/* Labels */}
        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
          {showAfter ? 'بعد' : 'قبل'}
        </div>
        <div className="absolute bottom-2 left-2 right-2 text-center">
          <p className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
            برای مشاهده تغییر کلیک کنید
          </p>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{item.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{item.description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function VideoCard({ item, icon: Icon }: { item: typeof educationalVideos[0], icon: typeof Video }) {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="relative aspect-video bg-muted">
        {/* Placeholder for video thumbnail */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-12 h-12 text-muted-foreground/50" />
        </div>
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
            <Play className="w-6 h-6 text-primary-foreground mr-[-2px]" fill="currentColor" />
          </div>
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-0.5 rounded text-xs">
          {item.duration}
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{item.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{item.description}</CardDescription>
      </CardContent>
    </Card>
  )
}

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Logo href="/" showText={true} />
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowRight className="w-4 h-4" />
              بازگشت به صفحه اصلی
            </Button>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <header className="max-w-6xl mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">گالری</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          مشاهده نمونه کارها، ویدیوهای آموزشی مراقبت از پوست و راهنمای استفاده از سایت
        </p>
      </header>

      {/* Main Content with Tabs */}
      <main className="max-w-6xl mx-auto px-4 pb-16">
        <Tabs defaultValue="before-after" className="w-full">
          <TabsList className="w-full max-w-lg mx-auto grid grid-cols-3 mb-8">
            <TabsTrigger value="before-after" className="gap-2">
              <ImageIcon className="w-4 h-4 hidden sm:block" />
              قبل و بعد
            </TabsTrigger>
            <TabsTrigger value="educational" className="gap-2">
              <Video className="w-4 h-4 hidden sm:block" />
              آموزش پوست
            </TabsTrigger>
            <TabsTrigger value="tutorials" className="gap-2">
              <BookOpen className="w-4 h-4 hidden sm:block" />
              راهنمای سایت
            </TabsTrigger>
          </TabsList>

          {/* Before/After Tab */}
          <TabsContent value="before-after">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">تصاویر قبل و بعد از درمان</h2>
              <p className="text-muted-foreground">
                برای مشاهده نتیجه درمان، روی هر تصویر کلیک کنید یا ماوس را روی آن نگه دارید
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {beforeAfterItems.map((item) => (
                <BeforeAfterCard key={item.id} item={item} />
              ))}
            </div>
            {beforeAfterItems.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>تصاویر به زودی اضافه خواهند شد</p>
              </div>
            )}
          </TabsContent>

          {/* Educational Videos Tab */}
          <TabsContent value="educational">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">ویدیوهای آموزشی مراقبت از پوست</h2>
              <p className="text-muted-foreground">
                آموزش‌های تخصصی برای مراقبت بهتر از پوست شما
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {educationalVideos.map((item) => (
                <VideoCard key={item.id} item={item} icon={Video} />
              ))}
            </div>
            {educationalVideos.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>ویدیوها به زودی اضافه خواهند شد</p>
              </div>
            )}
          </TabsContent>

          {/* Tutorial Videos Tab */}
          <TabsContent value="tutorials">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">راهنمای استفاده از سایت</h2>
              <p className="text-muted-foreground">
                آموزش‌های ویدیویی برای استفاده آسان از امکانات سایت
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tutorialVideos.map((item) => (
                <VideoCard key={item.id} item={item} icon={BookOpen} />
              ))}
            </div>
            {tutorialVideos.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>راهنماها به زودی اضافه خواهند شد</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© ۱۴۰۳ مطب درماتولوژی دکتر مریم. تمام حقوق محفوظ است.</p>
        </div>
      </footer>
    </div>
  )
}
