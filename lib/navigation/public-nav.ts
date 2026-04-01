/** Public marketing routes — single source for header / mobile menu (RTL, fa). */

export const PUBLIC_MAIN_NAV = [
  { href: '/', label: 'خانه' },
  { href: '/gallery', label: 'گالری' },
] as const

/** Single public entry: ایمیل + OTP for everyone; logged-in users use `/dashboard`. */
export const PUBLIC_AUTH_LINK = {
  href: '/auth/login',
  label: 'ورود',
  shortLabel: 'ورود',
} as const

export const PUBLIC_DASHBOARD_LINK = {
  href: '/dashboard',
  label: 'داشبورد',
  shortLabel: 'داشبورد',
} as const
