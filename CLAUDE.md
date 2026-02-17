# CurryDash Central Hub - AI Assistant Guide (Claude)

## Overview
CurryDash Central Hub is a role-based project management portal built with Next.js 14, TypeScript, and Prisma. This document provides context for Claude AI to assist developers working on this project.

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Custom CSS with spice-themed design tokens
- **Database**: PostgreSQL with Prisma ORM
- **Integrations**: Jira API, GitHub API, AI Chat (Anthropic Claude)

### Directory Structure
```
/src
  /app          # Next.js App Router pages
    /admin      # Admin dashboard
    /dev        # Developer dashboard
    /qa         # QA dashboard
    /stakeholder # Stakeholder dashboard
    /login      # Authentication pages
    /register
  /lib          # Utility libraries and API clients
    jira-client.ts      # Jira integration
    github-client.ts    # GitHub integration
    ai-chat-engine.ts   # AI chat functionality
  /styles       # Global styles and design tokens
/prisma
  schema.prisma # Database schema
```

## Role-Based System

### User Roles
1. **Admin** - System administration and user management
2. **Developer** - Code development and technical tasks
3. **QA** - Quality assurance and testing
4. **Stakeholder** - Project oversight and business metrics

### Color Palette (Spice Theme)
- **Turmeric** (#E6B04B) - Primary, QA role
- **Chili** (#C5351F) - Danger, Admin role
- **Coriander** (#4A7C59) - Success, Developer role
- **Cinnamon** (#5D4037) - Secondary, Stakeholder role
- **Cream** (#FFF8DC) - Background

## API Clients

### Jira Client
Location: `/src/lib/jira-client.ts`

Features:
- Search issues with JQL
- Create, read, update issues
- Get assigned issues

Environment variables required:
- `JIRA_BASE_URL`
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`

### GitHub Client
Location: `/src/lib/github-client.ts`

Features:
- List repositories and pull requests
- Get issues and PRs
- Create issues

Environment variables required:
- `GITHUB_TOKEN`

### AI Chat Engine
Location: `/src/lib/ai-chat-engine.ts`

Features:
- Session-based chat
- Role-specific prompts
- Context-aware responses

Environment variables required:
- `ANTHROPIC_API_KEY`
- `AI_API_ENDPOINT` (optional)
- `AI_MODEL` (optional)

## Database Schema

### Models
1. **User** - User accounts with authentication
2. **Role** - User roles with permissions
3. **Team** - Team organization
4. **TeamMember** - Many-to-many relationship between users and teams
5. **Notification** - User notifications system

### Key Relationships
- Users can have multiple roles
- Users can be members of multiple teams
- Notifications are linked to specific users

## Development Guidelines

### Adding New Features
1. Follow the established directory structure
2. Use TypeScript for type safety
3. Maintain the spice-themed color palette
4. Ensure role-based access control
5. Add appropriate error handling

### Styling
- Use CSS custom properties from `brand-tokens.css`
- Follow the established spacing scale (xs, sm, md, lg, xl, 2xl)
- Maintain consistent border radius and shadows
- Use role-specific colors where appropriate

### API Integration
- Always handle errors gracefully
- Use environment variables for sensitive data
- Implement proper TypeScript interfaces
- Add appropriate loading and error states

## Testing Considerations
- Test role-based access control
- Verify API integrations work correctly
- Ensure responsive design across devices
- Test database operations with Prisma

## Deployment Checklist
- [ ] Set all required environment variables
- [ ] Run database migrations with Prisma
- [ ] Configure Jira and GitHub integrations
- [ ] Set up AI API keys
- [ ] Test all role-based dashboards
- [ ] Verify authentication flow

## Common Tasks

### Running the Development Server
```bash
npm run dev
```

### Database Migrations
```bash
npx prisma migrate dev
npx prisma generate
```

### Type Checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

## Getting Help
When working with Claude AI on this project:
- Reference this document for architecture context
- Mention specific role requirements
- Cite the spice-themed color palette
- Reference the API client implementations
- Ask about database schema relationships

## Future Enhancements
- Implement authentication (NextAuth.js)
- Add real-time notifications (WebSockets)
- Create data visualization dashboards
- Implement file upload functionality
- Add user profile management
- Create team collaboration features
