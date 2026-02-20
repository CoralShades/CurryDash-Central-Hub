/**
 * Playwright Global Setup
 *
 * Mints Auth.js v5 JWT tokens for each role without OAuth browser flows.
 * Sets a webcrypto polyfill for Node.js 18 (jose requires Web Crypto API).
 *
 * Optional DB seed: set PLAYWRIGHT_SEED=1 to apply supabase/test-seed.sql.
 * Run manually once: npx supabase db execute --file supabase/test-seed.sql
 */
import { webcrypto } from 'node:crypto'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

// Polyfill Web Crypto for Node.js 18 (jose package needs globalThis.crypto.subtle)
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto })
}

import { encode } from 'next-auth/jwt'
import type { FullConfig } from '@playwright/test'

const AUTH_DIR = path.join(__dirname, '.auth')

const TEST_USERS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@test.currydash.local',
    name: 'Test Admin',
    role: 'admin',
    file: path.join(AUTH_DIR, 'admin.json'),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'dev@test.currydash.local',
    name: 'Test Developer',
    role: 'developer',
    file: path.join(AUTH_DIR, 'developer.json'),
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'qa@test.currydash.local',
    name: 'Test QA',
    role: 'qa',
    file: path.join(AUTH_DIR, 'qa.json'),
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'stake@test.currydash.local',
    name: 'Test Stakeholder',
    role: 'stakeholder',
    file: path.join(AUTH_DIR, 'stakeholder.json'),
  },
] as const

export default async function globalSetup(_config: FullConfig) {
  // Optionally seed test users into local Supabase (idempotent)
  if (process.env.PLAYWRIGHT_SEED === '1') {
    console.log('[global-setup] Seeding test users into local Supabase...')
    try {
      execSync(
        'npx supabase db execute --file supabase/test-seed.sql',
        { stdio: 'inherit', cwd: path.join(__dirname, '..') }
      )
    } catch (err) {
      console.warn('[global-setup] Warning: DB seed failed (local Supabase may not be running):', err)
    }
  }

  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('[global-setup] NEXTAUTH_SECRET (or AUTH_SECRET) must be set in env')
  }

  fs.mkdirSync(AUTH_DIR, { recursive: true })

  for (const user of TEST_USERS) {
    // Mint an Auth.js v5 JWE token matching what the jwt callback would produce
    const jwt = await encode({
      token: {
        sub: user.id,
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      secret,
      salt: 'authjs.session-token',
      maxAge: 24 * 60 * 60, // 24h
    })

    const storageState = {
      cookies: [
        {
          name: 'authjs.session-token',
          value: jwt,
          domain: 'localhost',
          path: '/',
          expires: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
          httpOnly: true,
          secure: false,
          sameSite: 'Lax' as const,
        },
      ],
      origins: [],
    }

    fs.writeFileSync(user.file, JSON.stringify(storageState, null, 2))
    console.log(`[global-setup] Wrote auth state for ${user.role} → ${user.file}`)
  }
}
