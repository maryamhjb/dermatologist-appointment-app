import { NextResponse } from 'next/server'

import { loadAdminRowForUserId } from '@/lib/auth/load-admin-for-user'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ isAdmin: false, admin: null })
  }

  const admin = await loadAdminRowForUserId(user.id)
  return NextResponse.json({ isAdmin: Boolean(admin), admin })
}
