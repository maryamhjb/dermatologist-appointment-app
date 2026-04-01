'use client'

import { Suspense, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getAuthCallbackUrl } from '@/lib/site-url'
import { normalizeFullName } from '@/lib/validation/patient-auth'
import type {
  LoginEmailFormValues,
  OtpFormValues,
  RegisterEmailFormValues,
} from '@/lib/validation/patient-auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoginEmailForm } from '@/components/auth/login-email-form'
import { RegisterEmailForm } from '@/components/auth/register-email-form'
import { OtpVerifyForm } from '@/components/auth/otp-verify-form'
import { AuthPageShell } from '@/components/auth/auth-page-shell'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type AuthTab = 'email-login' | 'email-register'
type EmailStep = 'email' | 'otp'

const tabListClass =
  'mb-6 grid h-auto w-full grid-cols-2 gap-1 rounded-lg border border-border bg-muted/40 p-1 shadow-none'

/** Size + radius only; active colors come from `TabsTrigger` (same as main nav). */
const tabTriggerClass =
  'h-11 rounded-md text-sm font-semibold shadow-none data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/55'

const formPanelClass =
  'rounded-xl border border-border bg-background p-5 sm:p-6 [&_input]:bg-muted/40 [&_input]:border-border/70 [&_input]:px-3.5'

function LoginPageContent() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<AuthTab>('email-login')
  const [step, setStep] = useState<EmailStep>('email')
  const [formKey, setFormKey] = useState(0)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')

  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    if (sp.get('error') === 'auth') {
      toast({
        title: 'خطا در تایید',
        description: 'لینک نامعتبر یا منقضی شده است.',
        variant: 'destructive',
      })
      window.history.replaceState({}, '', '/auth/login')
    }
  }, [toast])

  /** Legacy `?view=admin` bookmarks: same unified OTP flow. */
  useEffect(() => {
    if (searchParams.get('view') === 'admin') {
      const url = new URL(window.location.href)
      url.searchParams.delete('view')
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''))
    }
  }, [searchParams])

  const otpEmailRedirect = { emailRedirectTo: getAuthCallbackUrl('/dashboard') }

  const sendEmailOtp = async (
    mode: 'login' | 'register',
    overrides?: { email?: string; fullName?: string },
  ) => {
    const em = (overrides?.email ?? email).trim()
    const fnRaw = overrides?.fullName ?? fullName
    const fn = normalizeFullName(fnRaw)

    setServerError('')
    setLoading(true)
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: em,
        options: {
          ...otpEmailRedirect,
          shouldCreateUser: mode === 'register',
          ...(mode === 'register'
            ? {
                data: {
                  full_name: fn,
                },
              }
            : {}),
        },
      })
      if (otpError) {
        setServerError(otpError.message || 'ارسال کد ناموفق بود')
        toast({ title: 'خطا', description: otpError.message, variant: 'destructive' })
        return
      }
      setEmail(em)
      if (mode === 'register') setFullName(fn)
      setStep('otp')
      setFormKey((k) => k + 1)
      toast({
        title: 'کد ارسال شد',
        description: 'ایمیل خود را برای دریافت کد یک‌بارمصرف بررسی کنید.',
      })
    } catch (err) {
      setServerError('خطایی رخ داد')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const onLoginEmailSubmit = async (values: LoginEmailFormValues) => {
    await sendEmailOtp('login', { email: values.email })
  }

  const onRegisterSubmit = async (values: RegisterEmailFormValues) => {
    await sendEmailOtp('register', { email: values.email, fullName: values.fullName })
  }

  const onOtpSubmit = async (values: OtpFormValues) => {
    setServerError('')
    setLoading(true)
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: values.otp,
        type: 'email',
      })
      if (verifyError) {
        setServerError(verifyError.message || 'کد نامعتبر است')
        toast({ title: 'خطا', description: verifyError.message, variant: 'destructive' })
        return
      }
      toast({ title: 'ورود موفق', description: 'خوش آمدید' })
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setServerError('خطایی در تایید رخ داد')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    await sendEmailOtp(tab === 'email-register' ? 'register' : 'login', {
      email,
      fullName,
    })
  }

  const resetFlow = () => {
    setStep('email')
    setServerError('')
    setFormKey((k) => k + 1)
  }

  const onTabChange = (v: string) => {
    const next = v as AuthTab
    setTab(next)
    setServerError('')
    setStep('email')
    setFullName('')
    setFormKey((k) => k + 1)
  }

  const description =
    step === 'otp'
      ? 'کد ارسال‌شده به ایمیل را وارد کنید.'
      : tab === 'email-register'
        ? 'با ایمیل ثبت‌نام کنید؛ کد یک‌بارمصرف برای شما ارسال می‌شود.'
        : 'با ایمیل وارد شوید؛ کد یک‌بارمصرف برای شما ارسال می‌شود.'

  return (
    <AuthPageShell>
      <header className="mb-6 text-center sm:mb-8">
        <h1
          id="auth-page-heading"
          className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-[1.65rem]"
        >
          ورود و ثبت‌نام
        </h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
          {description}
        </p>
      </header>

      <Tabs value={tab} onValueChange={onTabChange} className="w-full">
        <TabsList className={tabListClass}>
          <TabsTrigger
            value="email-login"
            disabled={step === 'otp'}
            className={cn(tabTriggerClass)}
          >
            ورود
          </TabsTrigger>
          <TabsTrigger
            value="email-register"
            disabled={step === 'otp'}
            className={cn(tabTriggerClass)}
          >
            ثبت‌نام
          </TabsTrigger>
        </TabsList>
        {step === 'otp' ? (
          <p className="-mt-2 mb-4 text-center text-xs font-medium text-muted-foreground">
            {tab === 'email-register' ? 'تکمیل ثبت‌نام' : 'ورود با کد'}
          </p>
        ) : null}

        <TabsContent value="email-login" className="mt-0">
          <div className={formPanelClass}>
            {step === 'email' ? (
              <LoginEmailForm
                key={`login-email-${formKey}`}
                loading={loading}
                serverError={serverError || null}
                onSubmit={onLoginEmailSubmit}
              />
            ) : (
              <OtpVerifyForm
                key={`login-otp-${formKey}`}
                email={email}
                loading={loading}
                serverError={serverError || null}
                onSubmit={onOtpSubmit}
                onResend={handleResendOtp}
                onChangeEmail={resetFlow}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="email-register" className="mt-0">
          <div className={formPanelClass}>
            {step === 'email' ? (
              <RegisterEmailForm
                key={`reg-email-${formKey}`}
                loading={loading}
                serverError={serverError || null}
                onSubmit={onRegisterSubmit}
              />
            ) : (
              <OtpVerifyForm
                key={`reg-otp-${formKey}`}
                email={email}
                loading={loading}
                serverError={serverError || null}
                onSubmit={onOtpSubmit}
                onResend={handleResendOtp}
                onChangeEmail={resetFlow}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </AuthPageShell>
  )
}

function LoginPageFallback() {
  return (
    <AuthPageShell>
      <p className="text-center text-sm text-muted-foreground">در حال بارگذاری…</p>
    </AuthPageShell>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  )
}
