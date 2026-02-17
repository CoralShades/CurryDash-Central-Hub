# GitHub Copilot Instructions for CurryDash Central Hub

## Project Context
You are working on **CurryDash Central Hub**, a role-based project management portal built with Next.js 14, TypeScript, and Prisma. The application integrates with Jira, GitHub, and AI services to provide specialized dashboards for different user roles.

## Core Principles

### 1. Type Safety First
- Always use TypeScript with explicit types
- Leverage Prisma-generated types for database operations
- Define interfaces for all API responses
- Use generics where appropriate

### 2. Role-Based Architecture
The application has four primary user roles:
- **Admin** (`--role-admin`: #C5351F) - System administration
- **Developer** (`--role-dev`: #4A7C59) - Code development
- **QA** (`--role-qa`: #E6B04B) - Quality assurance
- **Stakeholder** (`--role-stakeholder`: #5D4037) - Project oversight

### 3. Design System (Spice Theme)
Always use CSS custom properties from `/src/styles/brand-tokens.css`:
- Colors: `--spice-turmeric`, `--spice-chili`, `--spice-coriander`, `--spice-cinnamon`, `--spice-cream`
- Spacing: `--space-xs` through `--space-2xl`
- Radius: `--radius-sm`, `--radius-md`, `--radius-lg`
- Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`

## Code Generation Guidelines

### React Components
```typescript
// Preferred pattern: Server Components by default
export default function ComponentName() {
  return (
    <div style={{ padding: 'var(--space-lg)' }}>
      {/* Content */}
    </div>
  )
}

// For client interactivity
'use client'

export default function InteractiveComponent() {
  const [state, setState] = useState('')
  // ...
}
```

### API Routes (Next.js 14 App Router)
```typescript
// /src/app/api/[endpoint]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Implementation
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Database Queries
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Always include proper error handling
try {
  const users = await prisma.user.findMany({
    include: {
      roles: true,
      teams: true
    }
  })
} catch (error) {
  console.error('Database error:', error)
  throw error
} finally {
  await prisma.$disconnect()
}
```

## Integration Patterns

### Jira Integration
```typescript
import { createJiraClient } from '@/lib/jira-client'

const jira = createJiraClient()
const issues = await jira.searchIssues('assignee = currentUser()')
```

### GitHub Integration
```typescript
import { createGitHubClient } from '@/lib/github-client'

const github = createGitHubClient()
const prs = await github.listPullRequests('owner', 'repo', 'open')
```

### AI Chat
```typescript
import { createAIChatEngine, AIChatEngine } from '@/lib/ai-chat-engine'

const ai = createAIChatEngine()
const session = ai.createSession(
  AIChatEngine.getProjectManagementPrompt('dev')
)
```

## Common Patterns

### Page Structure
```typescript
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <main style={{ padding: 'var(--space-2xl)', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ 
        marginBottom: 'var(--space-2xl)',
        borderBottom: '3px solid var(--role-[role])'
      }}>
        <h1 style={{ color: 'var(--role-[role])' }}>
          Dashboard Title
        </h1>
      </header>
      
      {/* Content grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'var(--space-lg)'
      }}>
        {/* Cards */}
      </div>
    </main>
  )
}
```

### Card Component Pattern
```typescript
<div style={{
  padding: 'var(--space-xl)',
  background: 'white',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-md)',
  borderTop: '4px solid var(--role-[role])'
}}>
  <h2>Card Title</h2>
  <p>Card content</p>
</div>
```

### Form Styling
```typescript
<input
  type="text"
  style={{
    width: '100%',
    padding: 'var(--space-md)',
    border: '2px solid var(--spice-turmeric)',
    borderRadius: 'var(--radius-md)',
    fontSize: '1rem',
  }}
/>
```

## Environment Variables

Required environment variables (never hardcode):
```bash
# Database
DATABASE_URL="postgresql://..."

# Jira
JIRA_BASE_URL="https://your-domain.atlassian.net"
JIRA_EMAIL="your-email@example.com"
JIRA_API_TOKEN="your-api-token"

# GitHub
GITHUB_TOKEN="ghp_your_token"

# AI
ANTHROPIC_API_KEY="sk-ant-..."
AI_API_ENDPOINT="https://api.anthropic.com/v1/messages"
AI_MODEL="claude-3-sonnet-20240229"
```

## File Organization

### Where to Add Files
- **Pages**: `/src/app/[route]/page.tsx`
- **API Routes**: `/src/app/api/[endpoint]/route.ts`
- **Components**: `/src/components/[ComponentName].tsx`
- **Utilities**: `/src/lib/[utility-name].ts`
- **Styles**: `/src/styles/[style-name].css`
- **Types**: `/src/types/[type-name].ts`

### Naming Conventions
- Files: `kebab-case.ts` or `PascalCase.tsx` (for components)
- Components: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- CSS Classes: `kebab-case`

## Testing Guidelines

### Unit Test Pattern
```typescript
import { describe, it, expect } from '@jest/globals'

describe('UtilityFunction', () => {
  it('should perform expected operation', () => {
    const result = utilityFunction(input)
    expect(result).toBe(expectedOutput)
  })
})
```

## Security Best Practices

1. **Never expose sensitive data**
   - Use environment variables for all secrets
   - Sanitize user input
   - Validate all external data

2. **Authentication checks**
   ```typescript
   function requireAuth(request: NextRequest) {
     const token = request.headers.get('authorization')
     if (!token) {
       throw new Error('Unauthorized')
     }
     return verifyToken(token)
   }
   ```

3. **Permission validation**
   ```typescript
   function requireRole(user: User, role: string) {
     if (!user.roles.some(r => r.name === role)) {
       throw new Error('Forbidden')
     }
   }
   ```

## Common Tasks

### Adding a New Dashboard Route
1. Create directory: `/src/app/[role]/`
2. Add `page.tsx` with role-specific styling
3. Use role color: `--role-[admin|dev|qa|stakeholder]`
4. Follow existing dashboard structure

### Adding a New API Client
1. Create file: `/src/lib/[service]-client.ts`
2. Define TypeScript interfaces for responses
3. Implement error handling
4. Export factory function using env vars
5. Add JSDoc comments

### Adding a Database Model
1. Update `/prisma/schema.prisma`
2. Run: `npx prisma migrate dev --name [migration_name]`
3. Run: `npx prisma generate`
4. Use Prisma Client in your code

## Performance Tips

- Use Server Components by default (Next.js 14)
- Add `'use client'` only when needed
- Implement proper loading states
- Use `<Link>` for client-side navigation
- Optimize images with `next/image`

## Accessibility

- Use semantic HTML elements
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Maintain color contrast ratios
- Test with screen readers

## When Suggesting Code

1. **Provide context**: Explain why you're suggesting specific patterns
2. **Use existing patterns**: Reference similar code in the project
3. **Include types**: Always include TypeScript types
4. **Handle errors**: Include try-catch blocks
5. **Follow style**: Use the spice-themed design tokens
6. **Be specific**: Reference exact file paths
7. **Consider roles**: Think about role-based access

## Documentation

When adding new features, update:
- `README.md` - User-facing features
- `CLAUDE.md` - Architecture changes
- `AGENTS.md` - Agent-specific guidance
- JSDoc comments - All public functions

## Quick Reference

### Common Imports
```typescript
import Link from 'next/link'
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createJiraClient } from '@/lib/jira-client'
import { createGitHubClient } from '@/lib/github-client'
import { createAIChatEngine } from '@/lib/ai-chat-engine'
```

### Spice Palette Colors
- Turmeric: `#E6B04B`
- Chili: `#C5351F`
- Coriander: `#4A7C59`
- Cinnamon: `#5D4037`
- Cream: `#FFF8DC`

Remember: CurryDash is all about role-based project management with a unique spice-themed design. Keep the code clean, typed, and accessible!
