#!/usr/bin/env node
/**
 * Manual OAuth auth capture for Playwright E2E tests.
 *
 * Launches a headed Chromium browser at /login. You manually click
 * "Continue with GitHub", complete the OAuth flow, and get redirected
 * to your role dashboard. The script detects your role from the URL
 * and saves storageState to e2e/.auth/{role}.json.
 *
 * Usage:
 *   node e2e/capture-auth.mjs
 *   node e2e/capture-auth.mjs --role admin   # override detected role
 */

import { chromium } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const authDir = path.join(__dirname, '.auth')

// Parse --role flag
const roleFlag = process.argv.find((_, i) => process.argv[i - 1] === '--role')

// Role detection from URL path
const ROLE_PATHS = {
  '/admin': 'admin',
  '/dev': 'developer',
  '/qa': 'qa',
  '/stakeholder': 'stakeholder',
}

async function main() {
  // Ensure .auth directory exists
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  console.log('Launching headed browser for manual OAuth login...\n')
  console.log('Instructions:')
  console.log('  1. Click "Continue with GitHub" on the login page')
  console.log('  2. Complete the GitHub OAuth flow')
  console.log('  3. Wait for redirect to your role dashboard')
  console.log('  4. The script will auto-detect your role and save auth state\n')

  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  // Navigate to login
  await page.goto('http://localhost:3000/login')
  console.log('Opened http://localhost:3000/login — complete the OAuth flow in the browser.\n')

  // Wait for redirect to a role dashboard (up to 5 minutes for manual login)
  try {
    await page.waitForURL(/localhost:3000\/(admin|dev|qa|stakeholder)/, {
      timeout: 300_000,
    })
  } catch {
    console.error('Timed out waiting for dashboard redirect (5 min limit).')
    console.error('Make sure your GitHub account has a role_id set in Supabase users table.')
    await browser.close()
    process.exit(1)
  }

  // Detect role from URL
  const url = new URL(page.url())
  let detectedRole = null
  for (const [pathPrefix, role] of Object.entries(ROLE_PATHS)) {
    if (url.pathname.startsWith(pathPrefix)) {
      detectedRole = role
      break
    }
  }

  const role = roleFlag || detectedRole
  if (!role) {
    console.error(`Could not detect role from URL: ${url.pathname}`)
    console.error('Use --role <admin|developer|qa|stakeholder> to specify manually.')
    await browser.close()
    process.exit(1)
  }

  // Save storage state
  const storagePath = path.join(authDir, `${role}.json`)
  await context.storageState({ path: storagePath })

  console.log(`Auth state saved to: ${storagePath}`)
  console.log(`Detected role: ${role}`)
  console.log(`\nYou can now run: npx playwright test --project=${role}`)

  await browser.close()
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
