'use client'

import { BookOpen, ImageIcon, Images, Video } from 'lucide-react'

import { GalleryBeforeAfterCard } from '@/components/gallery/gallery-before-after-card'
import { GalleryVideoCard } from '@/components/gallery/gallery-video-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  GALLERY_BEFORE_AFTER,
  GALLERY_EDUCATIONAL_VIDEOS,
  GALLERY_TUTORIAL_VIDEOS,
} from '@/lib/data/gallery-content'
import { SITE_CONTAINER, SITE_SECTION_Y } from '@/lib/layout/site-layout'
import { MARKETING_TAB_TRIGGER_CLASS } from '@/lib/ui/marketing-tab-trigger'
import { cn } from '@/lib/utils'

const tabTriggerInner = 'flex items-center justify-center gap-1.5 sm:gap-2'

export function GalleryView({ className }: { className?: string }) {
  return (
    <section className={cn(SITE_CONTAINER, SITE_SECTION_Y, 'text-start', className)}>
      <header className="mx-auto mb-7 max-w-xl text-center sm:mb-8 md:mb-9">
        <h1 className="text-balance text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-[1.65rem]">
          گالری
        </h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          نمونه کار، آموزش پوست و راهنمای سایت
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl bg-muted/25" aria-label="بخش‌های گالری">
        <Tabs defaultValue="before-after" className="w-full">
          <div className="border-b border-border/40 px-4 pb-4 pt-4 sm:px-6 sm:pb-5 sm:pt-5">
            <div className="flex items-start gap-3 sm:gap-4">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/7 text-primary sm:h-10 sm:w-10"
                aria-hidden
              >
                <Images className="size-4 sm:size-4.5" strokeWidth={1.65} />
              </div>
              <h2 className="min-w-0 flex-1 pt-0.5 text-base font-semibold tracking-tight text-foreground sm:text-lg">
                محتوای گالری
              </h2>
            </div>
            <div className="mt-4 sm:mt-5">
              <TabsList
                className="grid h-auto w-full grid-cols-3 gap-2 bg-transparent p-0 sm:gap-3"
                aria-label="نوع محتوا"
              >
                <TabsTrigger value="before-after" className={MARKETING_TAB_TRIGGER_CLASS}>
                  <span className={tabTriggerInner}>
                    <ImageIcon className="hidden size-3.5 shrink-0 sm:block sm:size-4" aria-hidden />
                    <span className="leading-tight">قبل و بعد</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="educational" className={MARKETING_TAB_TRIGGER_CLASS}>
                  <span className={tabTriggerInner}>
                    <Video className="hidden size-3.5 shrink-0 sm:block sm:size-4" aria-hidden />
                    <span className="leading-tight">آموزش پوست</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="tutorials" className={MARKETING_TAB_TRIGGER_CLASS}>
                  <span className={tabTriggerInner}>
                    <BookOpen className="hidden size-3.5 shrink-0 sm:block sm:size-4" aria-hidden />
                    <span className="leading-tight">راهنمای سایت</span>
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="before-after" className="mt-0 px-4 pb-5 pt-4 focus-visible:outline-none sm:px-6 sm:pb-6 sm:pt-5">
            <p className="mb-4 text-center text-xs text-muted-foreground sm:mb-5 sm:text-sm">
              کلیک یا نگه‌داشتن ماوس برای مقایسه قبل و بعد
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
              {GALLERY_BEFORE_AFTER.map((item) => (
                <GalleryBeforeAfterCard key={item.id} item={item} />
              ))}
            </div>
            {GALLERY_BEFORE_AFTER.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
                <ImageIcon className="size-12 opacity-40" aria-hidden />
                <p className="text-sm">تصاویر به‌زودی اضافه می‌شود.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="educational" className="mt-0 px-4 pb-5 pt-4 focus-visible:outline-none sm:px-6 sm:pb-6 sm:pt-5">
            <p className="mb-4 text-center text-xs text-muted-foreground sm:mb-5 sm:text-sm">
              ویدیوهای آموزشی مراقبت از پوست
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
              {GALLERY_EDUCATIONAL_VIDEOS.map((item) => (
                <GalleryVideoCard key={item.id} item={item} icon={Video} />
              ))}
            </div>
            {GALLERY_EDUCATIONAL_VIDEOS.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
                <Video className="size-12 opacity-40" aria-hidden />
                <p className="text-sm">ویدیوها به‌زودی اضافه می‌شود.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tutorials" className="mt-0 px-4 pb-5 pt-4 focus-visible:outline-none sm:px-6 sm:pb-6 sm:pt-5">
            <p className="mb-4 text-center text-xs text-muted-foreground sm:mb-5 sm:text-sm">
              راهنمای استفاده از امکانات سایت
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
              {GALLERY_TUTORIAL_VIDEOS.map((item) => (
                <GalleryVideoCard key={item.id} item={item} icon={BookOpen} />
              ))}
            </div>
            {GALLERY_TUTORIAL_VIDEOS.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
                <BookOpen className="size-12 opacity-40" aria-hidden />
                <p className="text-sm">راهنماها به‌زودی اضافه می‌شود.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
