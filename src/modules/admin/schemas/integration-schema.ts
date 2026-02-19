import { z } from 'zod'

export const integrationTypeSchema = z.enum(['jira', 'github', 'anthropic'])
export type IntegrationType = z.infer<typeof integrationTypeSchema>

export const testConnectionSchema = z.object({
  integration: integrationTypeSchema,
})
export type TestConnectionInput = z.infer<typeof testConnectionSchema>

export const saveJiraCredentialsSchema = z.object({
  integration: z.literal('jira'),
  baseUrl: z.string().url('Invalid Jira base URL'),
  email: z.string().email('Invalid email address'),
  apiToken: z.string().min(1, 'API token is required'),
  webhookSecret: z.string().optional(),
})
export type SaveJiraCredentialsInput = z.infer<typeof saveJiraCredentialsSchema>

export const saveGithubCredentialsSchema = z.object({
  integration: z.literal('github'),
  oauthToken: z.string().min(1, 'OAuth token is required'),
  webhookSecret: z.string().optional(),
})
export type SaveGithubCredentialsInput = z.infer<typeof saveGithubCredentialsSchema>

export const saveAnthropicCredentialsSchema = z.object({
  integration: z.literal('anthropic'),
  apiKey: z.string().min(1, 'API key is required'),
})
export type SaveAnthropicCredentialsInput = z.infer<typeof saveAnthropicCredentialsSchema>

export const saveCredentialsSchema = z.discriminatedUnion('integration', [
  saveJiraCredentialsSchema,
  saveGithubCredentialsSchema,
  saveAnthropicCredentialsSchema,
])
export type SaveCredentialsInput = z.infer<typeof saveCredentialsSchema>
