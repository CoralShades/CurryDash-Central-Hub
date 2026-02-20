'use server'

import { revalidateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { getJiraProjects, getActiveSprintIssues } from '@/lib/clients/jira-client'
import { getRepositories, getPullRequests, getWorkflowRuns } from '@/lib/clients/github-client'
import type { ApiResponse } from '@/types/api'
import type { JiraProject } from '@/types/jira'
import type { GitHubRepo } from '@/types/github'
import type { Json } from '@/types/database'
import {
  syncJiraDataSchema,
  syncGitHubDataSchema,
  listGitHubReposSchema,
  type SyncJiraDataInput,
  type SyncGitHubDataInput,
  type ListGitHubReposInput,
} from '../schemas/sync-integration-schema'

export interface JiraSyncResult {
  projectsImported: number
  issuesImported: number
  errors: string[]
}

export interface GitHubSyncResult {
  reposImported: number
  pullRequestsImported: number
  workflowRunsImported: number
  errors: string[]
}

/**
 * Lists available Jira projects from the connected Jira workspace.
 * Admin-only.
 */
export async function listJiraProjects(): Promise<ApiResponse<JiraProject[]>> {
  try {
    await requireAuth('admin')

    const projects = await getJiraProjects()

    logger.info('Listed Jira projects', {
      source: 'admin',
      data: { count: projects.length },
    })

    return { data: projects, error: null }
  } catch (err) {
    logger.error('Failed to list Jira projects', {
      source: 'admin',
      data: { error: err },
    })
    return {
      data: null,
      error: {
        code: 'INTEGRATION_ERROR',
        message: err instanceof Error ? err.message : 'Failed to list Jira projects',
      },
    }
  }
}

/**
 * Syncs Jira data for the selected project keys.
 * Upserts projects and their active sprint issues into the database.
 * Per-project errors are non-fatal — partial success is reported.
 * Admin-only.
 */
export async function syncJiraData(
  input: SyncJiraDataInput
): Promise<ApiResponse<JiraSyncResult>> {
  try {
    await requireAuth('admin')

    const validation = syncJiraDataSchema.safeParse(input)
    if (!validation.success) {
      return {
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0]?.message ?? 'Validation failed',
        },
      }
    }

    const { projectKeys } = validation.data
    const supabase = createAdminClient()
    const now = new Date().toISOString()

    // Fetch all available projects once to avoid multiple API calls
    const allProjects = await getJiraProjects()
    const projectMap = new Map(allProjects.map((p) => [p.key, p]))

    let projectsImported = 0
    let issuesImported = 0
    let projectFailures = 0
    const errors: string[] = []

    for (const projectKey of projectKeys) {
      try {
        const project = projectMap.get(projectKey)
        if (!project) {
          projectFailures++
          errors.push(`Project ${projectKey} not found in Jira workspace`)
          continue
        }

        // Upsert project record
        const { data: projectRow, error: projectError } = await supabase
          .from('jira_projects')
          .upsert(
            {
              project_key: project.key,
              name: project.name,
              description: project.description ?? null,
              raw_payload: project as unknown as Json,
              synced_at: now,
              updated_at: now,
            },
            { onConflict: 'project_key' }
          )
          .select('id')
          .single()

        if (projectError || !projectRow) {
          projectFailures++
          errors.push(`Failed to upsert project ${projectKey}: ${projectError?.message ?? 'unknown error'}`)
          continue
        }

        projectsImported++

        // Fetch active sprint issues for this project
        const issues = await getActiveSprintIssues(projectKey)

        if (issues.length > 0) {
          const issueRows = issues.map((issue) => ({
            issue_key: issue.key,
            jira_project_id: projectRow.id,
            jira_sprint_id: null,
            summary: issue.summary,
            issue_type: issue.issueType,
            status: issue.status,
            priority: issue.priority ?? null,
            assignee_email: issue.assignee?.emailAddress ?? null,
            raw_payload: issue as unknown as Json,
            updated_at: now,
          }))

          const { error: issuesError } = await supabase
            .from('jira_issues')
            .upsert(issueRows, { onConflict: 'issue_key' })

          if (issuesError) {
            errors.push(`Failed to upsert issues for ${projectKey}: ${issuesError.message}`)
          } else {
            issuesImported += issueRows.length
          }
        }
      } catch (projectErr) {
        projectFailures++
        errors.push(
          `Error syncing project ${projectKey}: ${projectErr instanceof Error ? projectErr.message : 'unknown error'}`
        )
      }
    }

    // Update system_health for jira source
    const { error: jiraHealthError } = await supabase.from('system_health').upsert(
      {
        source: 'jira',
        status: projectFailures === projectKeys.length ? 'error' : 'connected',
        metadata: {
          lastSyncAt: now,
          projectsImported,
          issuesImported,
        },
        updated_at: now,
      },
      { onConflict: 'source' }
    )
    if (jiraHealthError) {
      logger.warn('Failed to update system_health for jira', {
        source: 'admin',
        data: { error: jiraHealthError.message },
      })
    }

    revalidateTag('issues', 'max')

    logger.info('Jira sync completed', {
      source: 'admin',
      data: { projectsImported, issuesImported, errorCount: errors.length },
    })

    return { data: { projectsImported, issuesImported, errors }, error: null }
  } catch (err) {
    logger.error('Unexpected error during Jira sync', {
      source: 'admin',
      data: { error: err },
    })
    return {
      data: null,
      error: {
        code: 'SERVER_ERROR',
        message: err instanceof Error ? err.message : 'Failed to sync Jira data',
      },
    }
  }
}

/**
 * Lists available GitHub repositories for the authenticated user or org.
 * Admin-only.
 */
export async function listGitHubRepos(
  input: ListGitHubReposInput
): Promise<ApiResponse<GitHubRepo[]>> {
  try {
    await requireAuth('admin')

    const validation = listGitHubReposSchema.safeParse(input)
    if (!validation.success) {
      return {
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0]?.message ?? 'Validation failed',
        },
      }
    }

    const { org } = validation.data
    const repos = await getRepositories(org)

    logger.info('Listed GitHub repos', {
      source: 'admin',
      data: { count: repos.length, org: org ?? 'authenticated user' },
    })

    return { data: repos, error: null }
  } catch (err) {
    logger.error('Failed to list GitHub repos', {
      source: 'admin',
      data: { error: err },
    })
    return {
      data: null,
      error: {
        code: 'INTEGRATION_ERROR',
        message: err instanceof Error ? err.message : 'Failed to list GitHub repositories',
      },
    }
  }
}

/**
 * Syncs GitHub data for the selected repositories.
 * Upserts repos, open PRs, and recent workflow runs into the database.
 * Per-repo errors are non-fatal — partial success is reported.
 * Admin-only.
 */
export async function syncGitHubData(
  input: SyncGitHubDataInput
): Promise<ApiResponse<GitHubSyncResult>> {
  try {
    await requireAuth('admin')

    const validation = syncGitHubDataSchema.safeParse(input)
    if (!validation.success) {
      return {
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0]?.message ?? 'Validation failed',
        },
      }
    }

    const { repoFullNames } = validation.data
    const supabase = createAdminClient()
    const now = new Date().toISOString()

    let reposImported = 0
    let pullRequestsImported = 0
    let workflowRunsImported = 0
    let repoFailures = 0
    const errors: string[] = []

    // Pre-fetch repos for each unique owner to avoid N+1 API calls
    const uniqueOwners = [
      ...new Set(
        repoFullNames.map((name) => name.split('/')[0]).filter((o): o is string => Boolean(o))
      ),
    ]
    const reposByOwner = new Map<string, GitHubRepo[]>()
    for (const owner of uniqueOwners) {
      try {
        reposByOwner.set(owner, await getRepositories(owner))
      } catch {
        reposByOwner.set(owner, [])
      }
    }
    let personalRepos: GitHubRepo[] | null = null

    for (const repoFullName of repoFullNames) {
      try {
        const [owner, repoName] = repoFullName.split('/')
        if (!owner || !repoName) {
          repoFailures++
          errors.push(`Invalid repo format: ${repoFullName} (expected owner/name)`)
          continue
        }

        let repo = (reposByOwner.get(owner) ?? []).find((r) => r.fullName === repoFullName)

        if (!repo) {
          // Try listing for authenticated user in case it's a personal repo (fetched once)
          if (personalRepos === null) {
            personalRepos = await getRepositories()
          }
          repo = personalRepos.find((r) => r.fullName === repoFullName)
          if (!repo) {
            repoFailures++
            errors.push(`Repository ${repoFullName} not found`)
            continue
          }
        }

        const repoResult = await upsertAndSyncRepo(repo, owner, repoName, supabase, now)
        reposImported += repoResult.reposImported
        pullRequestsImported += repoResult.pullRequestsImported
        workflowRunsImported += repoResult.workflowRunsImported
        errors.push(...repoResult.errors)
      } catch (repoErr) {
        repoFailures++
        errors.push(
          `Error syncing repo ${repoFullName}: ${repoErr instanceof Error ? repoErr.message : 'unknown error'}`
        )
      }
    }

    // Update system_health for github source
    const { error: githubHealthError } = await supabase.from('system_health').upsert(
      {
        source: 'github',
        status: repoFailures === repoFullNames.length ? 'error' : 'connected',
        metadata: {
          lastSyncAt: now,
          reposImported,
          pullRequestsImported,
          workflowRunsImported,
        },
        updated_at: now,
      },
      { onConflict: 'source' }
    )
    if (githubHealthError) {
      logger.warn('Failed to update system_health for github', {
        source: 'admin',
        data: { error: githubHealthError.message },
      })
    }

    revalidateTag('github-ci', 'max')

    logger.info('GitHub sync completed', {
      source: 'admin',
      data: { reposImported, pullRequestsImported, workflowRunsImported, errorCount: errors.length },
    })

    return {
      data: { reposImported, pullRequestsImported, workflowRunsImported, errors },
      error: null,
    }
  } catch (err) {
    logger.error('Unexpected error during GitHub sync', {
      source: 'admin',
      data: { error: err },
    })
    return {
      data: null,
      error: {
        code: 'SERVER_ERROR',
        message: err instanceof Error ? err.message : 'Failed to sync GitHub data',
      },
    }
  }
}

interface SyncRepoResult {
  reposImported: number
  pullRequestsImported: number
  workflowRunsImported: number
  errors: string[]
}

type SupabaseAdminClient = ReturnType<typeof createAdminClient>

async function upsertAndSyncRepo(
  repo: GitHubRepo,
  owner: string,
  repoName: string,
  supabase: SupabaseAdminClient,
  now: string
): Promise<SyncRepoResult> {
  const errors: string[] = []
  let reposImported = 0
  let pullRequestsImported = 0
  let workflowRunsImported = 0

  const { data: repoRow, error: repoError } = await supabase
    .from('github_repos')
    .upsert(
      {
        full_name: repo.fullName,
        name: repo.name,
        description: repo.description ?? null,
        default_branch: repo.defaultBranch,
        raw_payload: repo as unknown as Json,
        synced_at: now,
        updated_at: now,
      },
      { onConflict: 'full_name' }
    )
    .select('id')
    .single()

  if (repoError || !repoRow) {
    errors.push(`Failed to upsert repo ${repo.fullName}: ${repoError?.message ?? 'unknown error'}`)
    return { reposImported, pullRequestsImported, workflowRunsImported, errors }
  }

  reposImported++

  try {
    const prs = await getPullRequests(owner, repoName, 'open')
    if (prs.length > 0) {
      const prRows = prs.map((pr) => ({
        pr_number: pr.number,
        github_repo_id: repoRow.id,
        title: pr.title,
        state: pr.state,
        author: pr.author ?? null,
        head_branch: pr.headBranch,
        base_branch: pr.baseBranch,
        raw_payload: pr as unknown as Json,
        updated_at: now,
      }))

      const { error: prError } = await supabase
        .from('github_pull_requests')
        .upsert(prRows, { onConflict: 'github_repo_id,pr_number' })

      if (prError) {
        errors.push(`Failed to upsert PRs for ${repo.fullName}: ${prError.message}`)
      } else {
        pullRequestsImported += prRows.length
      }
    }
  } catch (prErr) {
    errors.push(
      `Failed to fetch PRs for ${repo.fullName}: ${prErr instanceof Error ? prErr.message : 'unknown error'}`
    )
  }

  try {
    const runs = await getWorkflowRuns(owner, repoName)
    if (runs.length > 0) {
      const runRows = runs.map((run) => ({
        run_id: run.id,
        github_repo_id: repoRow.id,
        workflow_name: run.workflowName,
        head_branch: run.branch,
        head_sha: run.commitSha,
        status: run.status ?? 'unknown',
        conclusion: run.conclusion ?? null,
        html_url: run.htmlUrl,
        raw_payload: run as unknown as Json,
        github_created_at: run.createdAt,
        github_updated_at: run.updatedAt,
        synced_at: now,
        updated_at: now,
      }))

      const { error: runError } = await supabase
        .from('github_workflow_runs')
        .upsert(runRows, { onConflict: 'github_repo_id,run_id' })

      if (runError) {
        errors.push(`Failed to upsert workflow runs for ${repo.fullName}: ${runError.message}`)
      } else {
        workflowRunsImported += runRows.length
      }
    }
  } catch (runErr) {
    errors.push(
      `Failed to fetch workflow runs for ${repo.fullName}: ${runErr instanceof Error ? runErr.message : 'unknown error'}`
    )
  }

  return { reposImported, pullRequestsImported, workflowRunsImported, errors }
}
