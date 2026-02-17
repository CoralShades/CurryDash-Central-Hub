# CurryDash Central Hub 🌶️

A role-based project management portal built with Next.js 15, TypeScript, and Prisma. CurryDash brings together teams with specialized dashboards for admins, developers, QA engineers, and stakeholders, all wrapped in a unique spice-themed design.

## ✨ Features

### Role-Based Dashboards
- **Admin Dashboard** - User management, team organization, and system configuration
- **Developer Dashboard** - GitHub integration, Jira tickets, and AI coding assistant
- **QA Dashboard** - Test management, bug tracking, and quality reports
- **Stakeholder Dashboard** - Project status, analytics, and executive reports

### Integrations
- **Jira API** - Seamless issue tracking and project management
- **GitHub API** - Pull request reviews and code collaboration
- **AI Chat Engine** - Intelligent assistance powered by Claude (Anthropic)

### Design System
Unique spice-themed color palette:
- 🟡 **Turmeric** (#E6B04B) - Primary color, QA role
- 🔴 **Chili** (#C5351F) - Admin role, alerts
- 🟢 **Coriander** (#4A7C59) - Developer role, success states
- 🟤 **Cinnamon** (#5D4037) - Stakeholder role, secondary
- ⚪ **Cream** (#FFF8DC) - Background, neutral

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database
- Jira account (optional)
- GitHub account (optional)
- Anthropic API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/CoralShades/CurryDash-Central-Hub.git
   cd CurryDash-Central-Hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/currydash"

   # Jira Integration (optional)
   JIRA_BASE_URL="https://your-domain.atlassian.net"
   JIRA_EMAIL="your-email@example.com"
   JIRA_API_TOKEN="your-jira-api-token"

   # GitHub Integration (optional)
   GITHUB_TOKEN="ghp_your_github_token"

   # AI Chat (optional)
   ANTHROPIC_API_KEY="sk-ant-your-key"
   AI_API_ENDPOINT="https://api.anthropic.com/v1/messages"
   AI_MODEL="claude-3-sonnet-20240229"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
CurryDash-Central-Hub/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── login/             # Authentication
│   │   ├── register/          
│   │   ├── admin/             # Admin dashboard
│   │   ├── dev/               # Developer dashboard
│   │   ├── qa/                # QA dashboard
│   │   └── stakeholder/       # Stakeholder dashboard
│   ├── lib/                   # Utility libraries
│   │   ├── jira-client.ts    # Jira API integration
│   │   ├── github-client.ts  # GitHub API integration
│   │   └── ai-chat-engine.ts # AI chat functionality
│   └── styles/                # Global styles
│       ├── brand-tokens.css  # Design system tokens
│       └── globals.css       # Global styles
├── prisma/
│   └── schema.prisma         # Database schema
├── .github/
│   └── copilot-instructions.md
├── AGENTS.md                 # AI agents guide
├── CLAUDE.md                 # Claude AI context
└── README.md                 # This file
```

## 🗄️ Database Schema

### Models
- **User** - User accounts with authentication
- **Role** - User roles (admin, dev, qa, stakeholder)
- **Team** - Team organization
- **TeamMember** - User-team relationships
- **Notification** - User notification system

### Relationships
```mermaid
graph LR
    User -->|has many| Role
    User -->|belongs to many| Team
    Team -->|has many| TeamMember
    User -->|has many| Notification
```

## 🔌 API Clients

### Jira Client
```typescript
import { createJiraClient } from '@/lib/jira-client'

const jira = createJiraClient()
const issues = await jira.searchIssues('project = ABC AND status = "In Progress"')
```

### GitHub Client
```typescript
import { createGitHubClient } from '@/lib/github-client'

const github = createGitHubClient()
const prs = await github.listPullRequests('owner', 'repo', 'open')
```

### AI Chat Engine
```typescript
import { createAIChatEngine, AIChatEngine } from '@/lib/ai-chat-engine'

const ai = createAIChatEngine()
const session = ai.createSession(AIChatEngine.getProjectManagementPrompt('dev'))
const response = await ai.sendMessage(session.id, 'How do I solve this issue?')
```

## 🎨 Design Tokens

All design tokens are defined in `/src/styles/brand-tokens.css`:

```css
/* Spice Palette */
--spice-turmeric: #E6B04B;
--spice-chili: #C5351F;
--spice-coriander: #4A7C59;
--spice-cinnamon: #5D4037;
--spice-cream: #FFF8DC;

/* Role Colors */
--role-admin: var(--spice-chili);
--role-dev: var(--spice-coriander);
--role-qa: var(--spice-turmeric);
--role-stakeholder: var(--spice-cinnamon);

/* Spacing Scale */
--space-xs: 0.25rem;
--space-sm: 0.5rem;
--space-md: 1rem;
--space-lg: 1.5rem;
--space-xl: 2rem;
--space-2xl: 3rem;
```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Commands

- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma generate` - Generate Prisma Client
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma db seed` - Seed database (if seed file exists)

## 🔒 Security

- All API keys are stored in environment variables
- Authentication is required for dashboard access
- Role-based access control for different dashboards
- Input sanitization for user data
- Secure password hashing (when authentication is implemented)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Use TypeScript with strict mode
- Follow the established design system
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Guide for Claude AI assistance
- **[AGENTS.md](./AGENTS.md)** - Guide for AI agents and automation
- **[.github/copilot-instructions.md](./.github/copilot-instructions.md)** - GitHub Copilot instructions

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: CSS with custom properties
- **Integrations**: Jira API, GitHub API, Anthropic Claude

## 📝 License

This project is private and proprietary to CoralShades.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Anthropic for Claude AI
- Atlassian for Jira API
- GitHub for their excellent API
- The open-source community

## 📧 Contact

For questions or support, please contact the development team.

---

**Built with ❤️ and a dash of spice 🌶️**