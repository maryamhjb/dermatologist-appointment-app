import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Magic links often hit the Supabase "Site URL" (usually `/`) with `?code=…` when
 * `/auth/callback` is not allowlisted or the template falls back to Site URL.
 * Forward those requests to the real callback so `exchangeCodeForSession` runs.
 */
function redirectRootAuthParamsToCallback(request: NextRequest): NextResponse | null {
  const url = request.nextUrl.clone()
  if (url.pathname !== '/') return null

  const hasPkceCode = url.searchParams.has('code')
  const hasEmailOtpHash =
    url.searchParams.has('token_hash') && url.searchParams.has('type')
  if (!hasPkceCode && !hasEmailOtpHash) return null

  url.pathname = '/auth/callback'
  return NextResponse.redirect(url)
}

export async function proxy(request: NextRequest) {
  const authRedirect = redirectRootAuthParamsToCallback(request)
  if (authRedirect) return authRedirect

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
