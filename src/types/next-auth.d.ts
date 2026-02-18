import type { DefaultSession, DefaultJWT } from 'next-auth'
import type { Role } from '@/types/roles'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      role: Role | null
    }
  }

  interface User {
    role?: Role | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string
    role?: Role | null
  }
}
