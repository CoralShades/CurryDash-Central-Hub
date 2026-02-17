# CurryDash Central Hub - AI Agents Guide

## Overview
This document provides guidance for AI agents (automated assistants, copilots, and code generation tools) working with the CurryDash Central Hub codebase built with Next.js 15.

## Agent Personas

### Admin Agent
**Role**: System administration and user management automation
**Capabilities**:
- User provisioning and deprovisioning
- Role assignment and permission management
- System configuration updates
- Audit log analysis

**Example Tasks**:
- "Create a new user with developer role"
- "Generate a report of all admin users"
- "Update team permissions for project X"

### Developer Agent
**Role**: Code development assistance and technical automation
**Capabilities**:
- Code generation and refactoring
- Pull request analysis
- Jira ticket synchronization
- GitHub issue management

**Example Tasks**:
- "Analyze open PRs and suggest reviews"
- "Create a feature branch for Jira ticket ABC-123"
- "Generate boilerplate code for a new API route"

### QA Agent
**Role**: Quality assurance and testing automation
**Capabilities**:
- Test case generation
- Bug report analysis
- Test coverage recommendations
- Automated testing workflows

**Example Tasks**:
- "Generate test cases for the login flow"
- "Analyze recent bug reports for patterns"
- "Create a test plan for the admin dashboard"

### Stakeholder Agent
**Role**: Project insights and reporting automation
**Capabilities**:
- Metrics aggregation and visualization
- Status report generation
- Trend analysis
- Executive summaries

**Example Tasks**:
- "Generate weekly project status report"
- "Summarize team velocity trends"
- "Create executive dashboard metrics"

## Technical Guidelines for Agents

### Code Generation Standards
1. **TypeScript First**: Always generate TypeScript code with explicit types
2. **Functional Components**: Use React functional components with hooks
3. **Error Handling**: Include try-catch blocks for async operations
4. **Type Safety**: Use Prisma types for database operations

### Style Guidelines
```typescript
// ✅ Good: Use design tokens
const Button = styled.button`
  background: var(--spice-turmeric);
  padding: var(--space-md);
  border-radius: var(--radius-md);
`;

// ❌ Bad: Hard-coded values
const Button = styled.button`
  background: #E6B04B;
  padding: 16px;
  border-radius: 8px;
`;
```

### API Client Usage
```typescript
// Example: Using Jira client
import { createJiraClient } from '@/lib/jira-client';

const jira = createJiraClient();
const issues = await jira.searchIssues('project = ABC AND status = "In Progress"');

// Example: Using GitHub client
import { createGitHubClient } from '@/lib/github-client';

const github = createGitHubClient();
const prs = await github.listPullRequests('owner', 'repo', 'open');

// Example: Using AI chat
import { createAIChatEngine, AIChatEngine } from '@/lib/ai-chat-engine';

const ai = createAIChatEngine();
const session = ai.createSession(AIChatEngine.getProjectManagementPrompt('dev'));
const response = await ai.sendMessage(session.id, 'How do I fix this bug?');
```

### Database Operations
```typescript
// Example: Creating a user
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    passwordHash: hashedPassword,
    roles: {
      connect: [{ name: 'dev' }]
    }
  }
});

// Example: Querying with relations
const users = await prisma.user.findMany({
  include: {
    roles: true,
    teams: {
      include: {
        team: true
      }
    }
  }
});
```

## Agent Integration Patterns

### Event-Driven Actions
Agents should respond to specific events:
- **PR Created** → Developer Agent reviews code
- **Issue Created** → QA Agent generates test cases
- **Sprint End** → Stakeholder Agent generates reports
- **User Added** → Admin Agent sends welcome notification

### Context Awareness
Agents should maintain context about:
- Current sprint and milestones
- Active team members and their roles
- Recent deployments and releases
- Open issues and PRs

### Collaboration Between Agents
Agents can work together on complex tasks:
1. Developer Agent creates PR
2. QA Agent generates test cases
3. Admin Agent assigns reviewers
4. Stakeholder Agent updates metrics

## Security Considerations

### API Key Management
- Never hard-code API keys in generated code
- Always use environment variables
- Validate configuration before operations

### Permission Checks
```typescript
// Always verify user permissions before operations
function requireRole(user: User, roleName: string) {
  const hasRole = user.roles.some(role => role.name === roleName);
  if (!hasRole) {
    throw new Error(`Unauthorized: ${roleName} role required`);
  }
}
```

### Data Sanitization
```typescript
// Sanitize user input
import { escape } from 'html-escaper';

function sanitizeInput(input: string): string {
  return escape(input.trim());
}
```

## Testing Guidelines

### Unit Tests
Generate unit tests for all utility functions:
```typescript
describe('JiraClient', () => {
  it('should fetch issues with JQL', async () => {
    const client = new JiraClient(mockUrl, mockEmail, mockToken);
    const result = await client.searchIssues('project = TEST');
    expect(result.issues).toHaveLength(1);
  });
});
```

### Integration Tests
Test API integrations with mocked responses:
```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('https://api.github.com/repos/:owner/:repo', (req, res, ctx) => {
    return res(ctx.json({ name: 'test-repo' }));
  })
);
```

## Documentation Standards

### Code Comments
Add JSDoc comments for all public functions:
```typescript
/**
 * Fetches user by email address
 * @param email - User's email address
 * @returns User object or null if not found
 * @throws Error if database connection fails
 */
async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}
```

### README Updates
When adding new features, update documentation:
- Add to README.md if it's a major feature
- Update CLAUDE.md with architecture changes
- Document new environment variables

## Prompt Templates for Common Tasks

### Creating a New Page
```
Create a new Next.js page at /src/app/[route]/page.tsx with:
- TypeScript
- Role-based access for [role]
- Spice-themed styling
- Integration with [API client]
```

### Adding a Database Model
```
Add a new Prisma model for [entity] with:
- Fields: [list fields]
- Relations: [list relations]
- Indexes: [list indexes]
Update the schema and generate migration
```

### Implementing an API Route
```
Create an API route at /src/app/api/[endpoint]/route.ts with:
- GET/POST methods
- Authentication check
- Integration with [client]
- Error handling
```

## Best Practices Checklist

- [ ] Use TypeScript with strict mode
- [ ] Follow Next.js 14 App Router patterns
- [ ] Apply spice-themed color palette
- [ ] Include error handling
- [ ] Add loading states
- [ ] Implement proper types
- [ ] Write JSDoc comments
- [ ] Add unit tests
- [ ] Update documentation
- [ ] Check security implications

## Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Jira API Reference](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [GitHub API Reference](https://docs.github.com/en/rest)
- [Anthropic Claude API](https://docs.anthropic.com/)

## Getting Support

When agents need clarification:
1. Reference this document first
2. Check CLAUDE.md for architecture details
3. Review existing code patterns
4. Consult the API client implementations
5. Ask specific questions with context
