import NextAuth from 'next-auth'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import Resend from 'next-auth/providers/resend'
import type { Role } from '@/types/roles'
import { ROLES } from '@/types/roles'
import { logger } from '@/lib/logger'
import { AuthError } from '@/lib/errors'

/**
 * Fetches the user's role from the Supabase users table.
 * Uses the service role key to bypass RLS for this lookup.
 * Returns null if the user has no role assigned yet.
 */
async function getUserRole(userId: string): Promise<Role | null> {
  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      logger.warn('Supabase credentials not configured for role lookup', { source: 'auth' })
      return null
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=role_id,roles(name)`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      logger.warn('Failed to fetch user role from Supabase', {
        source: 'auth',
        data: { status: response.status, userId },
      })
      return null
    }

    const rows = (await response.json()) as Array<{ roles: { name: string } | null }>
    const roleName = rows[0]?.roles?.name

    if (roleName && ROLES.includes(roleName as Role)) {
      return roleName as Role
    }

    return null
  } catch (error) {
    logger.error('Error fetching user role', { source: 'auth', data: { error, userId } })
    return null
  }
}

/**
 * Ensures a public.users record exists for a given Auth.js user.
 * Called as a fallback if the DB trigger hasn't fired yet (race condition).
 * Creates the record with default role = developer.
 */
async function ensurePublicUser(userId: string, email?: string | null, name?: string | null, image?: string | null): Promise<Role | null> {
  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) return null

    // First, look up the developer role ID
    const roleRes = await fetch(
      `${supabaseUrl}/rest/v1/roles?name=eq.developer&select=id`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      }
    )

    if (!roleRes.ok) return null

    const roles = (await roleRes.json()) as Array<{ id: string }>
    const roleId = roles[0]?.id
    if (!roleId) return null

    // Upsert the user with developer role
    const upsertRes = await fetch(
      `${supabaseUrl}/rest/v1/users`,
      {
        method: 'POST',
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify({
          id: userId,
          email: email ?? '',
          full_name: name ?? null,
          avatar_url: image ?? null,
          role_id: roleId,
        }),
      }
    )

    if (!upsertRes.ok) {
      logger.warn('Failed to upsert public user fallback', {
        source: 'auth',
        data: { status: upsertRes.status, userId },
      })
      return null
    }

    logger.info('Created public user via fallback', { source: 'auth', data: { userId } })
    return 'developer'
  } catch (error) {
    logger.error('Error in ensurePublicUser fallback', { source: 'auth', data: { error, userId } })
    return null
  }
}

/**
 * Server Component helper — returns the current session user with role.
 * Throws AuthError if not authenticated or if the user's role is not one of the allowed roles.
 *
 * Usage in Server Components:
 *   const user = await requireAuth('admin')
 *   const user = await requireAuth('developer', 'admin')  // multiple roles allowed
 */
export async function requireAuth(...allowedRoles: Role[]) {
  const session = await auth()

  if (!session?.user) {
    throw new AuthError('Not authenticated', { redirect: '/login' })
  }

  const userRole = session.user.role as Role | null

  if (allowedRoles.length > 0 && (!userRole || !allowedRoles.includes(userRole))) {
    throw new AuthError('Insufficient permissions', {
      required: allowedRoles,
      actual: userRole,
    })
  }

  return { id: session.user.id, role: userRole, email: session.user.email }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL ?? '',
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  }),

  providers: [
    Resend({
      from: 'noreply@currydash.au',
    }),
    Google,
    GitHub,
  ],

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours (NFR-S2)
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      // On sign-in (user object present) or token refresh, inject role
      if (user?.id) {
        token.id = user.id
        token.role = await getUserRole(user.id)

        // Fallback: if trigger hasn't created public.users yet, do it now
        if (!token.role) {
          token.role = await ensurePublicUser(user.id, user.email, user.name, user.image)
        }
      }

      // On session update, re-fetch role to pick up admin changes
      if (trigger === 'update' && typeof token.id === 'string') {
        token.role = await getUserRole(token.id)
      }

      return token
    },

    async session({ session, token }) {
      // Surface role and id onto the session object for client use
      if (typeof token.id === 'string') {
        session.user.id = token.id
      }
      session.user.role = (token.role as Role | null) ?? null
      return session
    },

    async redirect({ url, baseUrl }) {
      // Post-login: redirect to role-appropriate dashboard
      // Allow relative URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (url.startsWith(baseUrl)) return url

      // Default: role redirect happens in middleware for protected routes
      return baseUrl
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  // NFR-S9: never log tokens or sensitive data
  debug: process.env.NODE_ENV === 'development',
})
