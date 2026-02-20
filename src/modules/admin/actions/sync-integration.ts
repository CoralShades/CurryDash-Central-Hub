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
    const errors: string[] = []

    for (const projectKey of projectKeys) {
      try {
        const project = projectMap.get(projectKey)
        if (!project) {
          errors.push(`Project ${projectKey} not found in Jira workspace`)
          continue
        }

        // Upsert project record
        const { data: projectRow, error: projectError } = await supabase
          .from('jira_projects')
          .upsert(
            {
              jira_id: project.id,
              project_key: project.key,
              name: project.name,
              description: project.description ?? null,
              synced_at: now,
              updated_at: now,
            },
            { onConflict: 'project_key' }
          )
          .select('id')
          .single()

        if (projectError || !projectRow) {
          errors.push(`Failed to upsert project ${projectKey}: ${projectError?.message ?? 'unknown error'}`)
          continue
        }

        projectsImported++

        // Fetch active sprint issues for this project
        const issues = await getActiveSprintIssues(projectKey)

        if (issues.length > 0) {
          const issueRows = issues.map((issue) => ({
            issue_key: issue.key,
            project_id: projectRow.id,
            sprint_id: null,
            summary: issue.summary,
            issue_type: issue.issueType,
            status: issue.status,
            priority: issue.priority ?? null,
            assignee_email: issue.assignee?.emailAddress ?? null,
            story_points: issue.storyPoints ?? null,
            labels: [] as string[],
            jira_created_at: issue.created,
            jira_updated_at: issue.updated,
            synced_at: now,
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
        errors.push(
          `Error syncing project ${projectKey}: ${projectErr instanceof Error ? projectErr.message : 'unknown error'}`
        )
      }
    }

    // Update system_health for jira source
    await supabase.from('system_health').upsert(
      {
        source: 'jira',
        status: errors.length === projectKeys.length ? 'error' : 'connected',
        metadata: {
          lastSyncAt: now,
          projectsImported,
          issuesImported,
        },
        updated_at: now,
      },
      { onConflict: 'source' }
    )

    revalidateTag('issues')

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
    const errors: string[] = []

    for (const repoFullName of repoFullNames) {
      try {
        const [owner, repoName] = repoFullName.split('/')
        if (!owner || !repoName) {
          errors.push(`Invalid repo format: ${repoFullName} (expected owner/name)`)
          continue
        }

        // Fetch repos for this owner to get the matching repo details
        const repos = await getRepositories(owner)
        const repo = repos.find((r) => r.fullName === repoFullName)

        if (!repo) {
          // Try listing for authenticated user in case it's a personal repo
          const allRepos = await getRepositories()
          const personalRepo = allRepos.find((r) => r.fullName === repoFullName)
          if (!personalRepo) {
            errors.push(`Repository ${repoFullName} not found`)
            continue
          }
          // Use personal repo
          const repoResult = await upsertAndSyncRepo(
            personalRepo,
            owner,
            repoName,
            supabase,
            now,
            errors
          )
          reposImported += repoResult.reposImported
          pullRequestsImported += repoResult.pullRequestsImported
          workflowRunsImported += repoResult.workflowRunsImported
          continue
        }

        const repoResult = await upsertAndSyncRepo(repo, owner, repoName, supabase, now, errors)
        reposImported += repoResult.reposImported
        pullRequestsImported += repoResult.pullRequestsImported
        workflowRunsImported += repoResult.workflowRunsImported
      } catch (repoErr) {
        errors.push(
          `Error syncing repo ${repoFullName}: ${repoErr instanceof Error ? repoErr.message : 'unknown error'}`
        )
      }
    }

    // Update system_health for github source
    await supabase.from('system_health').upsert(
      {
        source: 'github',
        status: errors.length === repoFullNames.length ? 'error' : 'connected',
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

    revalidateTag('github-ci')

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
}

type SupabaseAdminClient = ReturnType<typeof createAdminClient>

async function upsertAndSyncRepo(
  repo: GitHubRepo,
  owner: string,
  repoName: string,
  supabase: SupabaseAdminClient,
  now: string,
  errors: string[]
): Promise<SyncRepoResult> {
  let reposImported = 0
  let pullRequestsImported = 0
  let workflowRunsImported = 0

  // Upsert github_repos record
  const { data: repoRow, error: repoError } = await supabase
    .from('github_repos')
    .upsert(
      {
        repo_id: repo.id,
        full_name: repo.fullName,
        name: repo.name,
        description: repo.description,
        default_branch: repo.defaultBranch,
        is_private: repo.isPrivate,
        language: repo.language,
        stars_count: repo.stargazersCount,
        open_issues_count: repo.openIssuesCount,
        synced_at: now,
        updated_at: now,
      },
      { onConflict: 'repo_id' }
    )
    .select('id')
    .single()

  if (repoError || !repoRow) {
    errors.push(`Failed to upsert repo ${repo.fullName}: ${repoError?.message ?? 'unknown error'}`)
    return { reposImported, pullRequestsImported, workflowRunsImported }
  }

  reposImported++

  // Sync open pull requests
  try {
    const prs = await getPullRequests(owner, repoName, 'open')
    if (prs.length > 0) {
      const prRows = prs.map((pr) => ({
        pr_number: pr.number,
        repo_id: repoRow.id, // Supabase UUID FK
        title: pr.title,
        state: pr.state,
        author_login: pr.author,
        author_avatar_url: pr.authorAvatarUrl || null,
        head_branch: pr.headBranch,
        base_branch: pr.baseBranch,
        is_draft: pr.isDraft,
        additions: pr.additions,
        deletions: pr.deletions,
        changed_files: pr.changedFiles,
        merged_at: pr.mergedAt,
        raw_payload: {} as Json,
        github_created_at: pr.createdAt,
        github_updated_at: pr.updatedAt,
        synced_at: now,
        updated_at: now,
      }))

      const { error: prError } = await supabase
        .from('github_pull_requests')
        .upsert(prRows, { onConflict: 'pr_number,repo_id' })

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

  // Sync recent workflow runs
  try {
    const runs = await getWorkflowRuns(owner, repoName)
    if (runs.length > 0) {
      const runRows = runs.map((run) => ({
        run_id: run.id,
        github_repo_id: repoRow.id, // Supabase UUID FK
        workflow_name: run.workflowName,
        head_branch: run.branch,
        head_sha: run.commitSha,
        status: run.status ?? 'unknown',
        conclusion: run.conclusion ?? null,
        html_url: run.htmlUrl,
        raw_payload: {} as Json,
        github_created_at: run.createdAt,
        github_updated_at: run.updatedAt,
        synced_at: now,
        updated_at: now,
      }))

      const { error: runError } = await supabase
        .from('github_workflow_runs')
        .upsert(runRows, { onConflict: 'run_id' })

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

  return { reposImported, pullRequestsImported, workflowRunsImported }
}
