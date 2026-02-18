import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/middleware'
import type { Role } from '@/types/roles'

/** Routes accessible without authentication */
const PUBLIC_PATHS = ['/login', '/register', '/api/webhooks']

/** Route prefix → required role mapping */
const ROUTE_ROLE_MAP: Record<string, Role> = {
  '/admin': 'admin',
  '/dev': 'developer',
  '/qa': 'qa',
  '/stakeholder': 'stakeholder',
}

/** Default landing page for each role after authentication */
const ROLE_HOME: Record<Role, string> = {
  admin: '/admin',
  developer: '/dev',
  qa: '/qa',
  stakeholder: '/stakeholder',
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function getRequiredRole(pathname: string): Role | null {
  for (const [prefix, role] of Object.entries(ROUTE_ROLE_MAP)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return role
    }
  }
  return null
}

export default auth(async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Refresh Supabase session cookie on every pass (sliding session)
  const response = NextResponse.next()
  createClient(request, response)

  // Public routes — no auth required
  if (isPublicPath(pathname)) {
    return response
  }

  // @ts-expect-error — Auth.js v5 augments NextRequest with .auth in middleware
  const session = request.auth

  // Unauthenticated — redirect to /login
  if (!session?.user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  const userRole = session.user.role as Role | null
  const requiredRole = getRequiredRole(pathname)

  // Protected route with no specific role mapping — allow any authenticated user
  if (!requiredRole) {
    return response
  }

  // Role mismatch — silently redirect to the user's home dashboard (no error flash)
  if (userRole !== requiredRole) {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = userRole ? ROLE_HOME[userRole] : '/login'
    return NextResponse.redirect(homeUrl)
  }

  return response
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public asset files (png, jpg, svg, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
