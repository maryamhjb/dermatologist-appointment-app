'use client'

import { useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { otpFormSchema, type OtpFormValues } from '@/lib/validation/patient-auth'
import { useFieldFeedbackVisibility } from '@/hooks/use-field-feedback-visibility'
import { Button } from '@/components/ui/button'
import { AuthFormFieldFeedback } from '@/components/auth/auth-form-field-feedback'
import { AuthFormServerAlert } from '@/components/auth/auth-form-server-alert'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  authFormRootClass,
  authFormSecondaryActionsClass,
  authOtpInputClassName,
} from '@/lib/ui/auth-form-styles'
import { cn } from '@/lib/utils'

export function OtpVerifyForm({
  email,
  onSubmit,
  onResend,
  onChangeEmail,
  loading,
  serverError,
}: {
  email: string
  onSubmit: (values: OtpFormValues) => void | Promise<void>
  onResend: () => void | Promise<void>
  onChangeEmail: () => void
  loading: boolean
  serverError: string | null
}) {
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { otp: '' },
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const { errors, isValid } = useFormState({ control: form.control })
  const showFieldFeedback = useFieldFeedbackVisibility(form.control, 'otp')
  const otpVal = form.watch('otp')
  const otpErr = errors.otp
  const normalizedOtp = otpVal.replace(/\s/g, '')

  const otpOk =
    showFieldFeedback && !otpErr && normalizedOtp.length >= 4 && isValid

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={authFormRootClass}>
        <p className="text-start text-[0.625rem] leading-relaxed text-muted-foreground sm:text-[0.6875rem]">
          کد به{' '}
          <span className="font-medium text-foreground tabular-nums" dir="ltr">
            {email}
          </span>{' '}
          ارسال شد.
        </p>
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>کد یک‌بارمصرف</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="کد ایمیل"
                  disabled={loading}
                  dir="ltr"
                  className={cn(
                    authOtpInputClassName,
                    otpOk && 'border-emerald-600/60 dark:border-emerald-500/50',
                  )}
                  {...field}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value.replace(/\s/g, ''))}
                />
              </FormControl>
              <AuthFormFieldFeedback
                align="start"
                errorText={otpErr?.message}
                showSuccess={otpOk}
                successText="کد کامل است."
              />
            </FormItem>
          )}
        />
        <AuthFormServerAlert message={serverError} />
        <Button
          type="submit"
          disabled={loading || !isValid}
          className="h-11 w-full rounded-lg font-semibold"
        >
          {loading ? 'درحال تایید...' : 'تایید و ورود'}
        </Button>
        <div className={authFormSecondaryActionsClass}>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full rounded-lg border-border font-medium md:h-11"
            disabled={loading}
            onClick={() => onResend()}
          >
            ارسال مجدد کد
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-10 w-full rounded-lg font-medium text-muted-foreground hover:text-foreground md:h-11"
            onClick={onChangeEmail}
          >
            تغییر ایمیل
          </Button>
        </div>
      </form>
    </Form>
  )
}
