/**
 * Base URL for auth redirects (email confirmation, OAuth). Set in production.
 * Supabase Dashboard → Authentication → URL Configuration → Site URL / Redirect URLs must include this origin + /auth/callback
 */
export function getSiteUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'
}

export function getAuthCallbackUrl(nextPath = '/dashboard'): string {
  const base = getSiteUrl()
  const next = nextPath.startsWith('/') ? nextPath : `/${nextPath}`
  return `${base}/auth/callback?next=${encodeURIComponent(next)}`
}
