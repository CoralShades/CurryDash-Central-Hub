import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Admin Supabase client — use only in server-side code (webhooks, cron jobs, seed scripts).
 * Uses the service role key which BYPASSES Row Level Security.
 * NEVER expose this client to the browser or return it from Server Actions.
 *
 * Valid use cases: webhook handlers, cron routes, admin operations that must
 * bypass RLS by design (e.g., writing dead_letter_events, upserting webhook data).
 */
export function createAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for admin operations'
    )
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
