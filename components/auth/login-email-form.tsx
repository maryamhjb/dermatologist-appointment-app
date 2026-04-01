'use client'

import { useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  loginEmailFormSchema,
  type LoginEmailFormValues,
} from '@/lib/validation/patient-auth'
import { useFieldFeedbackVisibility } from '@/hooks/use-field-feedback-visibility'
import { Button } from '@/components/ui/button'
import { AuthFormFieldFeedback } from '@/components/auth/auth-form-field-feedback'
import { AuthFormServerAlert } from '@/components/auth/auth-form-server-alert'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { authFormRootClass, authInputClassName } from '@/lib/ui/auth-form-styles'
import { cn } from '@/lib/utils'

export function LoginEmailForm({
  onSubmit,
  loading,
  serverError,
  initialEmail = '',
}: {
  onSubmit: (values: LoginEmailFormValues) => void | Promise<void>
  loading: boolean
  serverError: string | null
  initialEmail?: string
}) {
  const form = useForm<LoginEmailFormValues>({
    resolver: zodResolver(loginEmailFormSchema),
    defaultValues: { email: initialEmail },
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const { errors, isValid } = useFormState({ control: form.control })
  const showFieldFeedback = useFieldFeedbackVisibility(form.control, 'email')
  const emailVal = form.watch('email')
  const emailErr = errors.email

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={authFormRootClass}>
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
                    !emailErr &&
                      showFieldFeedback &&
                      emailVal.trim().length > 0 &&
                      isValid &&
                      'border-emerald-600/60 dark:border-emerald-500/50',
                  )}
                  {...field}
                />
              </FormControl>
              <AuthFormFieldFeedback
                errorText={emailErr?.message}
                showSuccess={
                  Boolean(
                    !emailErr &&
                      showFieldFeedback &&
                      emailVal.trim().length > 0 &&
                      isValid,
                  )
                }
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
