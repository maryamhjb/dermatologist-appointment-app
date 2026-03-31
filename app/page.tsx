'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/logo'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Logo href="/" showText={true} />
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline">ورود بیماران</Button>
            </Link>
            <Link href="/admin/login">
              <Button variant="ghost">پنل مدیریت</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold mb-4">
          خدمات تخصصی درماتولوژی
        </h2>
        <p className="text-xl text-muted-foreground mb-8">
          سیستم جدید رزرو نوبت و خدمات درماتولوژی دکتر مریم
        </p>
        <Link href="/auth/login">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            رزرو نوبت جدید
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>رزرو آنلاین</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                رزرو نوبت به صورت آنلاین و انتخاب بهترین زمان برای خود
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>نوبت‌های قابل رصد</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                مشاهده تاریخچه نوبت‌های خود و وضعیت تایید آن‌ها
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>سیستم امتیازات</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                کسب امتیاز از نظرات و نقد‌ها و تبدیل آن‌ها به تخفیف
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تهران و کرج</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                مطب‌های تهران (چهارشنبه) و کرج (شنبه، یکشنبه، سه‌شنبه)
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>خدمات متنوع</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                انواع خدمات درماتولوژی و زیبایی با قیمت‌های مشخص
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>پشتیبانی</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                پشتیبانی آنلاین و تماس مستقیم با مطب برای سؤالات
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Offices Section */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold mb-8 text-center">مطب‌های ما</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>مطب تهران</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold">نشانی:</p>
                <p className="text-muted-foreground">سعادت آباد - بلوار کوهستان - رو به روی ایال - پلاک ۱۱</p>
              </div>
              <div>
                <p className="font-semibold">تلفن:</p>
                <p className="text-muted-foreground">۰۹۱۳۰۳۰۱۹۱۹</p>
              </div>
              <div>
                <p className="font-semibold">روزهای کاری:</p>
                <p className="text-muted-foreground">چهارشنبه</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>مطب کرج</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold">نشانی:</p>
                <p className="text-muted-foreground">چهاره طالقانی به سمت میدان شهدا - برج آراد - طبقه هشتم - واحد ۸۰۳</p>
              </div>
              <div>
                <p className="font-semibold">تلفن:</p>
                <p className="text-muted-foreground">۰۹۹۱۱۳۲۰۰۳۰</p>
              </div>
              <div>
                <p className="font-semibold">روزهای کاری:</p>
                <p className="text-muted-foreground">شنبه، یکشنبه، سه‌شنبه</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© ۱۴۰۳ مطب درماتولوژی دکتر مریم. تمام حقوق محفوظ است.</p>
        </div>
      </footer>
    </div>
  )
}
