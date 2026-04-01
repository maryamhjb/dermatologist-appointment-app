'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/logo'
import { createClient } from '@/lib/supabase/client'

function ConfirmationForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationalNumber: '',
    phoneNumber: '',
  })

  // Get booking details from URL params
  const clinic = searchParams.get('clinic') || ''
  const date = searchParams.get('date') || ''
  const jalaliDate = searchParams.get('jalali') || ''

  useEffect(() => {
    if (!clinic || !date) {
      router.push('/')
    }
  }, [clinic, date, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validate all fields
    if (!formData.firstName || !formData.lastName || !formData.nationalNumber || !formData.phoneNumber) {
      setError('لطفاً تمام فیلدها را پر کنید')
      setIsSubmitting(false)
      return
    }

    // Validate national number (10 digits)
    if (!/^\d{10}$/.test(formData.nationalNumber)) {
      setError('کد ملی باید ۱۰ رقم باشد')
      setIsSubmitting(false)
      return
    }

    // Validate phone number (11 digits starting with 09)
    if (!/^09\d{9}$/.test(formData.phoneNumber)) {
      setError('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود')
      setIsSubmitting(false)
      return
    }

    try {
      const supabase = createClient()
      
      const { error: insertError } = await supabase
        .from('appointments')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          national_number: formData.nationalNumber,
          phone_number: formData.phoneNumber,
          clinic: clinic,
          appointment_date: date,
          appointment_jalali: jalaliDate,
          status: 'pending'
        })

      if (insertError) {
        console.error('Insert error:', insertError)
        setError('خطا در ثبت نوبت. لطفاً دوباره تلاش کنید.')
        setIsSubmitting(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      console.error('Error:', err)
      setError('خطا در ارتباط با سرور')
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <CardTitle className="text-green-600">نوبت شما با موفقیت ثبت شد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription className="text-base">
              {formData.firstName} {formData.lastName} عزیز، نوبت شما برای تاریخ {jalaliDate} در مطب {clinic === 'tehran' ? 'تهران' : 'کرج'} ثبت گردید.
            </CardDescription>
            <CardDescription>
              در صورت نیاز به هماهنگی، با شما تماس گرفته خواهد شد.
            </CardDescription>
            <Button onClick={() => router.push('/')} className="w-full mt-4">
              بازگشت به صفحه اصلی
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle>تایید نوبت</CardTitle>
          <CardDescription>
            لطفاً اطلاعات خود را برای تایید نوبت وارد کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Appointment Summary */}
          <div className="bg-muted p-4 rounded-lg mb-6 text-right">
            <p className="font-medium mb-2">اطلاعات نوبت:</p>
            <p className="text-sm text-muted-foreground">
              مطب: {clinic === 'tehran' ? 'تهران' : 'کرج'}
            </p>
            <p className="text-sm text-muted-foreground">
              تاریخ: {jalaliDate}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">نام</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="نام"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">نام خانوادگی</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="نام خانوادگی"
                  className="text-right"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationalNumber">کد ملی</Label>
              <Input
                id="nationalNumber"
                name="nationalNumber"
                value={formData.nationalNumber}
                onChange={handleInputChange}
                placeholder="۱۰ رقم"
                className="text-right"
                dir="ltr"
                maxLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">شماره موبایل</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                className="text-right"
                dir="ltr"
                maxLength={11}
              />
            </div>

            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'در حال ثبت...' : 'تایید و ثبت نوبت'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>در حال بارگذاری...</p>
      </div>
    }>
      <ConfirmationForm />
    </Suspense>
  )
}
