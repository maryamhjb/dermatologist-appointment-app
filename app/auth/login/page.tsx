'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { useToast } from '@/hooks/use-toast'
import { Logo } from '@/components/logo'

export default function LoginPage() {
  const [step, setStep] = useState<'login' | 'register'>('login')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const formatPhone = (input: string): string => {
    const cleaned = input.replace(/\D/g, '')
    if (cleaned.startsWith('0')) return cleaned.slice(1) + '@drmaryam.ir'
    return cleaned + '@drmaryam.ir'
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!phone || !password) { setError('شماره تلفن و رمز عبور را وارد کنید'); return }
    setLoading(true)
    try {
      const email = formatPhone(phone)
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        if (signInError.message.includes('Invalid login')) {
          setError('شماره تلفن یا رمز عبور اشتباه است')
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('حساب کاربری شما هنوز تایید نشده است')
        } else {
          setError('خطا در ورود. لطفا دوباره تلاش کنید')
        }
      } else {
        toast({ title: 'ورود موفق', description: 'خوش آمدید' })
        router.push('/dashboard')
      }
    } catch {
      setError('خطایی رخ داد. لطفا دوباره تلاش کنید')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!phone || !password) { setError('همه فیلدها را پر کنید'); return }
    if (password.length < 6) { setError('رمز عبور باید حداقل ۶ کاراکتر باشد'); return }
    if (password !== confirmPassword) { setError('رمز عبور و تکرار آن یکسان نیستند'); return }
    setLoading(true)
    try {
      const email = formatPhone(phone)
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { phone_number: phone },
          emailRedirectTo: undefined,
        }
      })
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('این شماره تلفن قبلاً ثبت شده است. لطفا وارد شوید')
        } else {
          setError('خطا در ثبت‌نام: ' + signUpError.message)
        }
      } else {
        toast({ title: 'ثبت‌نام موفق', description: 'حساب شما ایجاد شد' })
        router.push('/dashboard')
      }
    } catch {
      setError('خطایی رخ داد. لطفا دوباره تلاش کنید')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo href="/" showText={false} />
          </div>
          <CardTitle className="text-xl text-primary">{'دکتر مریم حاجی‌بابایی'}</CardTitle>
          <CardDescription>
            {step === 'login' ? 'ورود به سیستم رزرو نوبت' : 'ثبت‌نام در سیستم رزرو نوبت'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>{'شماره تلفن'}</FieldLabel>
                  <Input
                    type="tel"
                    placeholder="09xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    required
                    dir="ltr"
                    className="text-left"
                  />
                </Field>
                <Field>
                  <FieldLabel>{'رمز عبور'}</FieldLabel>
                  <Input
                    type="password"
                    placeholder="رمز عبور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    dir="ltr"
                    className="text-left"
                  />
                </Field>
              </FieldGroup>
              {error && (
                <div className="p-3 rounded-lg text-sm text-red-600 bg-red-50 border border-red-200">
                  {error}
                </div>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'درحال ورود...' : 'ورود'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {'حساب کاربری ندارید؟ '}
                <button
                  type="button"
                  onClick={() => { setStep('register'); setError('') }}
                  className="text-primary font-semibold hover:underline"
                >
                  ثبت‌نام کنید
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>{'شماره تلفن'}</FieldLabel>
                  <Input
                    type="tel"
                    placeholder="09xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    required
                    dir="ltr"
                    className="text-left"
                  />
                </Field>
                <Field>
                  <FieldLabel>{'رمز عبور'}</FieldLabel>
                  <Input
                    type="password"
                    placeholder="رمز عبور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    dir="ltr"
                    className="text-left"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {'پیشنهاد: از کد ملی خود به عنوان رمز عبور استفاده کنید'}
                  </p>
                </Field>
                <Field>
                  <FieldLabel>{'تکرار رمز عبور'}</FieldLabel>
                  <Input
                    type="password"
                    placeholder="تکرار رمز عبور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                    dir="ltr"
                    className="text-left"
                  />
                </Field>
              </FieldGroup>
              {error && (
                <div className="p-3 rounded-lg text-sm text-red-600 bg-red-50 border border-red-200">
                  {error}
                </div>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'درحال ثبت‌نام...' : 'ثبت‌نام'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {'قبلاً ثبت‌نام کرده‌اید؟ '}
                <button
                  type="button"
                  onClick={() => { setStep('login'); setError('') }}
                  className="text-primary font-semibold hover:underline"
                >
                  وارد شوید
                </button>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
