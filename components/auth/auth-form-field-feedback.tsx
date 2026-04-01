'use client'

import { useFormField } from '@/components/ui/form'
import { cn } from '@/lib/utils'

/** One line at compact validation size */
const ROW_LINE = 'min-h-[1rem]'

type AuthFormFieldFeedbackProps = {
  hint?: React.ReactNode
  errorText?: string
  successText?: string
  showSuccess?: boolean
  align?: 'start' | 'center'
  className?: string
}

export function AuthFormFieldFeedback({
  hint,
  errorText,
  successText,
  showSuccess,
  align = 'start',
  className,
}: AuthFormFieldFeedbackProps) {
  const { formMessageId, formDescriptionId } = useFormField()
  const hasErr = Boolean(errorText)
  const showOk = Boolean(showSuccess && successText && !hasErr)

  return (
    <div className={cn('flex w-full flex-col gap-0.5', className)}>
      {hint != null ? (
        <p
          id={formDescriptionId}
          className="text-pretty text-start text-[0.625rem] leading-relaxed text-muted-foreground sm:text-[0.6875rem]"
        >
          {hint}
        </p>
      ) : (
        <span id={formDescriptionId} hidden aria-hidden="true" />
      )}
      <div
        className={cn(
          ROW_LINE,
          'flex items-start text-pretty',
          align === 'center' ? 'justify-center text-center' : 'text-start',
        )}
        aria-live="polite"
      >
        {hasErr ? (
          <p
            role="alert"
            id={formMessageId}
            className="w-full text-pretty text-[0.625rem] font-medium leading-snug text-destructive sm:text-[0.6875rem]"
          >
            {errorText}
          </p>
        ) : showOk ? (
          <p
            id={formMessageId}
            className="w-full text-pretty text-[0.625rem] font-medium leading-snug text-emerald-700 dark:text-emerald-400 sm:text-[0.6875rem]"
          >
            {successText}
          </p>
        ) : (
          <p
            id={formMessageId}
            className="invisible w-full select-none text-[0.625rem] font-medium leading-snug sm:text-[0.6875rem]"
            aria-hidden="true"
          >
            {'\u00a0'}
          </p>
        )}
      </div>
    </div>
  )
}
