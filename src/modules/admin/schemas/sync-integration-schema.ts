import { z } from 'zod'

export const syncJiraDataSchema = z.object({
  projectKeys: z.array(z.string().min(1)).min(1, 'Select at least one project'),
})
export type SyncJiraDataInput = z.infer<typeof syncJiraDataSchema>

export const syncGitHubDataSchema = z.object({
  repoFullNames: z.array(z.string()).min(1, 'Select at least one repo'),
})
export type SyncGitHubDataInput = z.infer<typeof syncGitHubDataSchema>

export const listGitHubReposSchema = z.object({
  org: z.string().optional(),
})
export type ListGitHubReposInput = z.infer<typeof listGitHubReposSchema>
