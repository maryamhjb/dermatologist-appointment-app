'use client'

import { useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  registerEmailFormSchema,
  type RegisterEmailFormValues,
} from '@/lib/validation/patient-auth'
import { useFieldFeedbackVisibility } from '@/hooks/use-field-feedback-visibility'
import { Button } from '@/components/ui/button'
import { AuthFormFieldFeedback } from '@/components/auth/auth-form-field-feedback'
import { AuthFormServerAlert } from '@/components/auth/auth-form-server-alert'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { authFormRootClass, authInputClassName } from '@/lib/ui/auth-form-styles'
import { cn } from '@/lib/utils'

export function RegisterEmailForm({
  onSubmit,
  loading,
  serverError,
  initialFullName = '',
  initialEmail = '',
}: {
  onSubmit: (values: RegisterEmailFormValues) => void | Promise<void>
  loading: boolean
  serverError: string | null
  initialFullName?: string
  initialEmail?: string
}) {
  const form = useForm<RegisterEmailFormValues>({
    resolver: zodResolver(registerEmailFormSchema),
    defaultValues: { fullName: initialFullName, email: initialEmail },
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const { errors, isValid } = useFormState({ control: form.control })
  const showNameFb = useFieldFeedbackVisibility(form.control, 'fullName')
  const showEmailFb = useFieldFeedbackVisibility(form.control, 'email')

  const fullNameVal = form.watch('fullName')
  const emailVal = form.watch('email')
  const nameErr = errors.fullName
  const emailErr = errors.email

  const nameOk = showNameFb && !nameErr && fullNameVal.trim().length > 0
  const emailOk = showEmailFb && !emailErr && emailVal.trim().length > 0

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={authFormRootClass}>
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem dir="rtl">
              <FormLabel>نام و نام خانوادگی</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  autoComplete="name"
                  placeholder="مثال: مریم احمدی"
                  disabled={loading}
                  maxLength={120}
                  className={cn(
                    authInputClassName,
                    nameOk && 'border-emerald-600/60 dark:border-emerald-500/50',
                  )}
                  {...field}
                />
              </FormControl>
              <AuthFormFieldFeedback
                hint="نام و نام خانوادگی را با فاصله جدا کنید؛ حداقل دو بخش (مثال: علی رضایی)."
                errorText={nameErr?.message}
                showSuccess={nameOk}
                successText="نام و نام خانوادگی معتبر است."
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ایمیل</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={loading}
                  dir="ltr"
                  className={cn(
                    authInputClassName,
                    emailOk && 'border-emerald-600/60 dark:border-emerald-500/50',
                  )}
                  {...field}
                />
              </FormControl>
              <AuthFormFieldFeedback
                errorText={emailErr?.message}
                showSuccess={emailOk}
                successText="فرمت ایمیل معتبر است."
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
          {loading ? 'درحال ارسال...' : 'ارسال کد به ایمیل'}
        </Button>
      </form>
    </Form>
  )
}
