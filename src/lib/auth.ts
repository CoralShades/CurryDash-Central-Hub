import NextAuth from 'next-auth'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import Resend from 'next-auth/providers/resend'
import type { Role } from '@/types/roles'
import { ROLES } from '@/types/roles'
import { logger } from '@/lib/logger'

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
