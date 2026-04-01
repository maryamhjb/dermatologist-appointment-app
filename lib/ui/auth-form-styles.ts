import { cn } from '@/lib/utils'

/** Vertical rhythm between fields, server alert, and primary submit */
export const authFormRootClass = 'flex flex-col gap-4'

/** Outline / ghost actions below the primary submit */
export const authFormSecondaryActionsClass = 'flex flex-col gap-2'

/** Single-line fields: 44px height, radius aligned with buttons, readable size on mobile */
export const authInputClassName =
  'h-11 w-full rounded-lg py-2 text-base md:text-sm'

/** OTP: monospace, optical tracking; `md:text-lg` overrides `md:text-sm` from base */
export const authOtpInputClassName = cn(
  authInputClassName,
  'text-center font-mono tabular-nums tracking-[0.2em] md:text-lg md:tracking-[0.28em]',
)
