export interface GitHubRepo {
  id: number
  fullName: string
  name: string
  description: string | null
  defaultBranch: string
  isPrivate: boolean
  language: string | null
  stargazersCount: number
  openIssuesCount: number
  updatedAt: string
}

export interface PullRequest {
  id: number
  number: number
  title: string
  state: 'open' | 'closed' | 'merged'
  author: string
  authorAvatarUrl: string
  headBranch: string
  baseBranch: string
  isDraft: boolean
  reviewDecision?: 'APPROVED' | 'CHANGES_REQUESTED' | 'REVIEW_REQUIRED' | null
  ciStatus?: 'success' | 'failure' | 'pending' | 'neutral' | null
  additions: number
  deletions: number
  changedFiles: number
  createdAt: string
  updatedAt: string
  mergedAt?: string | null
  repoFullName: string
}

export interface CommitActivity {
  date: string
  commitCount: number
  additions: number
  deletions: number
  author: string
}

export interface WorkflowRun {
  id: number
  name: string
  status: 'queued' | 'in_progress' | 'completed'
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | null
  workflowName: string
  branch: string
  commitSha: string
  createdAt: string
  updatedAt: string
  htmlUrl: string
  repoFullName: string
}

export interface GitHubWebhookEvent {
  action?: string
  repository?: {
    full_name: string
    name: string
    id: number
  }
  pull_request?: {
    number: number
    title: string
    state: string
    user: { login: string; avatar_url: string }
    head: { ref: string; sha: string }
    base: { ref: string }
    draft: boolean
    merged_at?: string | null
    additions?: number
    deletions?: number
    changed_files?: number
  }
  workflow_run?: {
    id: number
    name: string
    status: string
    conclusion: string | null
    head_branch: string
    head_sha: string
    created_at: string
    updated_at: string
    html_url: string
  }
  commits?: Array<{
    id: string
    message: string
    author: { name: string; email: string }
  }>
  sender?: {
    login: string
    avatar_url: string
  }
}
