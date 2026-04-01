import { z } from 'zod'

export function normalizeFullName(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

const PART_ORDINAL_FA = ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم'] as const

/** User-visible character count (grapheme clusters); falls back to Unicode code points. */
export function countNameGraphemes(segment: string): number {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const seg = new Intl.Segmenter('fa', { granularity: 'grapheme' })
    let n = 0
    for (const _ of seg.segment(segment)) n += 1
    return n
  }
  return [...segment].length
}

/** Structured result for interactive validation */
export function validateFullNameDetailed(value: string): { ok: true } | { ok: false; message: string } {
  const t = normalizeFullName(value)
  if (!t) return { ok: false, message: 'نام و نام خانوادگی را وارد کنید.' }
  if (t.length > 120) return { ok: false, message: 'نام و نام خانوادگی بیش از حد طولانی است.' }

  const parts = t.split(' ')
  if (parts.length < 2) {
    return { ok: false, message: 'نام و نام خانوادگی را با فاصله جدا کنید (مثال: مریم احمدی).' }
  }
  if (parts.length > 6) return { ok: false, message: 'حداکثر ۶ بخش برای نام مجاز است.' }

  const partOk =
    /^(?=.*[\p{L}\u0600-\u06FF])[\p{L}\u0600-\u06FF\u200c\u200d\-ʼ']{2,40}$/u

  for (let i = 0; i < parts.length; i += 1) {
    const p = parts[i]
    const ordinal = PART_ORDINAL_FA[i] ?? String(i + 1)
    const g = countNameGraphemes(p)

    if (/\d/.test(p)) {
      return { ok: false, message: `بخش ${ordinal} نباید شامل عدد باشد.` }
    }
    if (g < 2) {
      return {
        ok: false,
        message: `بخش ${ordinal} باید حداقل دو حرف داشته باشد (مثلاً نام خانوادگی کامل).`,
      }
    }
    if (g > 40) {
      return { ok: false, message: `بخش ${ordinal} از حد مجاز طولانی‌تر است.` }
    }
    if (!partOk.test(p)) {
      return {
        ok: false,
        message: `بخش ${ordinal}: فقط حروف فارسی یا لاتین، نیم‌فاصله و خط تیره مجاز است.`,
      }
    }
  }
  return { ok: true }
}

const emailField = z
  .string()
  .transform((s) => s.trim())
  .pipe(
    z
      .string()
      .min(1, 'ایمیل را وارد کنید.')
      .email('فرمت ایمیل معتبر نیست.')
      .max(254, 'ایمیل بیش از حد طولانی است.'),
  )

export const loginEmailFormSchema = z.object({
  email: emailField,
})

export type LoginEmailFormValues = z.infer<typeof loginEmailFormSchema>

export const registerEmailFormSchema = z.object({
  fullName: z.string().superRefine((raw, ctx) => {
    const r = validateFullNameDetailed(raw)
    if (!r.ok) ctx.addIssue({ code: 'custom', message: r.message })
  }),
  email: emailField,
})

export type RegisterEmailFormValues = z.infer<typeof registerEmailFormSchema>

export const otpFormSchema = z.object({
  otp: z
    .string()
    .transform((s) => s.replace(/\s/g, ''))
    .pipe(
      z
        .string()
        .min(4, 'کد را وارد کنید.')
        .max(64, 'کد بیش از حد طولانی است.'),
    ),
})

export type OtpFormValues = z.infer<typeof otpFormSchema>
