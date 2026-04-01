import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export type AdminRow = {
  id: string
  full_name: string
  role: string
  email: string
}

/**
 * Reads `admin_users` for a given auth user id.
 * Prefers the service role so RLS (or broken self-referential policies) cannot hide the row.
 */
export async function loadAdminRowForUserId(userId: string): Promise<AdminRow | null> {
  const service = createServiceRoleClient()
  if (service) {
    const { data, error } = await service
      .from('admin_users')
      .select('id, full_name, role, email')
      .eq('id', userId)
      .maybeSingle()
    if (error) {
      console.error('[loadAdminRowForUserId] service role:', error.message)
      return null
    }
    return data as AdminRow | null
  }

  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[loadAdminRowForUserId] SUPABASE_SERVICE_ROLE_KEY missing; admin check uses the anon client and may fail under RLS.',
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, full_name, role, email')
    .eq('id', userId)
    .maybeSingle()
  if (error) {
    console.error('[loadAdminRowForUserId] user JWT:', error.message)
    return null
  }
  return data as AdminRow | null
}
