export type BeforeAfterItem = {
  id: number
  title: string
  description: string
  before: string
  after: string
}

export type GalleryVideoItem = {
  id: number
  title: string
  description: string
  thumbnail: string
  duration: string
  videoUrl: string
}

export const GALLERY_BEFORE_AFTER: BeforeAfterItem[] = [
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

export const GALLERY_EDUCATIONAL_VIDEOS: GalleryVideoItem[] = [
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

export const GALLERY_TUTORIAL_VIDEOS: GalleryVideoItem[] = [
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
    description: 'دسترسی به نوبت‌های قبلی و آینده',
    thumbnail: '/placeholder-tutorial-3.jpg',
    duration: '۴:۱۵',
    videoUrl: '#',
  },
  {
    id: 4,
    title: 'سیستم امتیازات و تخفیف',
    description: 'کسب امتیاز و استفاده از تخفیف',
    thumbnail: '/placeholder-tutorial-4.jpg',
    duration: '۵:۳۰',
    videoUrl: '#',
  },
]
