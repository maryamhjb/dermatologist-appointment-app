'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Format phone number to +98 format
  const formatPhone = (input: string): string => {
    const cleaned = input.replace(/\D/g, '')
    if (cleaned.startsWith('0')) {
      return '+98' + cleaned.slice(1)
    }
    if (cleaned.startsWith('98')) {
      return '+' + cleaned
    }
    return '+98' + cleaned
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formattedPhone = formatPhone(phone)
      
      // Supabase Phone Auth with OTP
      const { error: signInError } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: true,
        },
      })

      if (signInError) {
        setError(signInError.message || 'خطا در ارسال کد')
        toast({
          title: 'خطا',
          description: signInError.message,
          variant: 'destructive',
        })
      } else {
        setStep('otp')
        toast({
          title: 'کد تایید ارسال شد',
          description: 'کد تایید برای شماره تلفن شما ارسال شد',
        })
      }
    } catch (err) {
      setError('خطایی در ارسال کد رخ داد')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formattedPhone = formatPhone(phone)
      
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      })

      if (verifyError) {
        setError(verifyError.message || 'کد نامعتبر است')
        toast({
          title: 'خطا',
          description: verifyError.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'ورود موفق',
          description: 'خوش آمدید',
        })
        router.push('/dashboard')
      }
    } catch (err) {
      setError('خطایی در تایید کد رخ داد')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">مطب درماتولوژی دکتر مریم</CardTitle>
          <CardDescription>ورود به سیستم رزرو نوبت</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>شماره تلفن</FieldLabel>
                  <Input
                    type="tel"
                    placeholder="09xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    required
                  />
                </Field>
              </FieldGroup>
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <span>{'درحال ارسال...'}</span> : <span>{'ارسال کد تایید'}</span>}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>کد تایید</FieldLabel>
                  <Input
                    type="text"
                    placeholder="xxxxxx"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={loading}
                    maxLength={6}
                    required
                  />
                </Field>
              </FieldGroup>
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'درحال تایید...' : 'تایید کد'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep('phone')
                  setOtp('')
                  setError('')
                }}
                className="w-full"
              >
                برگشت
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
