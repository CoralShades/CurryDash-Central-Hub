import { Octokit } from '@octokit/rest'
import { IntegrationError, RateLimitError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import type { GitHubRepo, PullRequest, WorkflowRun } from '@/types/github'

const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000]
const RATE_LIMIT_WARNING_THRESHOLD = 500

let rateLimitRemaining: number | null = null

function createClient(): Octokit {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    throw new IntegrationError('GitHub token not configured', { missing: ['GITHUB_TOKEN'] })
  }

  const octokit = new Octokit({ auth: token })

  // Track rate limit remaining from response headers
  octokit.hook.after('request', (response) => {
    const remaining = response.headers['x-ratelimit-remaining']
    if (remaining) {
      rateLimitRemaining = parseInt(remaining, 10)
      if (rateLimitRemaining < RATE_LIMIT_WARNING_THRESHOLD) {
        logger.warn('GitHub rate limit low', {
          source: 'webhook:github',
          data: { remaining: rateLimitRemaining, threshold: RATE_LIMIT_WARNING_THRESHOLD },
        })
      }
    }
  })

  return octokit
}

async function withRetry<T>(fn: () => Promise<T>, attempt = 0): Promise<T> {
  try {
    return await fn()
  } catch (error: unknown) {
    const status = (error as { status?: number })?.status
    if (status === 429 && attempt < RETRY_DELAYS_MS.length) {
      const delay = RETRY_DELAYS_MS[attempt]
      logger.warn('GitHub rate limit hit, retrying', {
        source: 'webhook:github',
        data: { attempt: attempt + 1, delayMs: delay },
      })
      await new Promise((resolve) => setTimeout(resolve, delay))
      return withRetry(fn, attempt + 1)
    }
    if (status === 429) {
      throw new RateLimitError('GitHub API rate limit exceeded after max retries')
    }
    throw new IntegrationError('GitHub API request failed', { status, error: String(error) })
  }
}

export function getRateLimitRemaining(): number | null {
  return rateLimitRemaining
}

export async function getRepositories(org?: string): Promise<GitHubRepo[]> {
  const octokit = createClient()
  return withRetry(async () => {
    const response = org
      ? await octokit.repos.listForOrg({ org, per_page: 100, sort: 'updated' })
      : await octokit.repos.listForAuthenticatedUser({ per_page: 100, sort: 'updated' })

    return response.data.map((repo) => ({
      id: repo.id,
      fullName: repo.full_name,
      name: repo.name,
      description: repo.description ?? null,
      defaultBranch: repo.default_branch ?? 'main',
      isPrivate: repo.private,
      language: repo.language ?? null,
      stargazersCount: repo.stargazers_count ?? 0,
      openIssuesCount: repo.open_issues_count ?? 0,
      updatedAt: repo.updated_at ?? new Date().toISOString(),
    }))
  })
}

export async function getPullRequests(
  owner: string,
  repo: string,
  state: 'open' | 'closed' | 'all' = 'open'
): Promise<PullRequest[]> {
  const octokit = createClient()
  return withRetry(async () => {
    const response = await octokit.pulls.list({
      owner,
      repo,
      state,
      per_page: 50,
      sort: 'updated',
      direction: 'desc',
    })

    return response.data.map((pr) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      state: pr.merged_at ? 'merged' : (pr.state as 'open' | 'closed'),
      author: pr.user?.login ?? 'unknown',
      authorAvatarUrl: pr.user?.avatar_url ?? '',
      headBranch: pr.head.ref,
      baseBranch: pr.base.ref,
      isDraft: pr.draft ?? false,
      reviewDecision: null,
      ciStatus: null,
      additions: 0,
      deletions: 0,
      changedFiles: 0,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      mergedAt: pr.merged_at ?? null,
      repoFullName: `${owner}/${repo}`,
    }))
  })
}

export async function getWorkflowRuns(owner: string, repo: string): Promise<WorkflowRun[]> {
  const octokit = createClient()
  return withRetry(async () => {
    const response = await octokit.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      per_page: 20,
    })

    return response.data.workflow_runs.map((run) => ({
      id: run.id,
      name: run.name ?? 'Unknown',
      status: run.status as WorkflowRun['status'],
      conclusion: run.conclusion as WorkflowRun['conclusion'],
      workflowName: run.name ?? 'Unknown',
      branch: run.head_branch ?? 'unknown',
      commitSha: run.head_sha,
      createdAt: run.created_at,
      updatedAt: run.updated_at,
      htmlUrl: run.html_url,
      repoFullName: `${owner}/${repo}`,
    }))
  })
}
