'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { testConnection, saveCredentials } from '@/modules/admin/actions/configure-integration'
import type { IntegrationInfo } from '@/modules/admin/actions/configure-integration'
import type { IntegrationType } from '@/modules/admin/schemas/integration-schema'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface IntegrationConfigFormProps {
  info: IntegrationInfo
  /** When true, hides the Test Connection button (for use inside IntegrationCardActions) */
  hideTestButton?: boolean
}

/**
 * IntegrationConfigForm — Client Component
 * Renders the "Configure" button that opens a credential entry modal
 * and a "Test Connection" button. Credentials are submitted via server actions.
 * API keys are never exposed — only masked hints from server are shown.
 */
export function IntegrationConfigForm({ info, hideTestButton = false }: IntegrationConfigFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form field state — empty means "keep existing"
  const [jiraBaseUrl, setJiraBaseUrl] = useState('')
  const [jiraEmail, setJiraEmail] = useState('')
  const [jiraToken, setJiraToken] = useState('')
  const [jiraWebhookSecret, setJiraWebhookSecret] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [githubWebhookSecret, setGithubWebhookSecret] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')

  const handleTestConnection = async () => {
    setIsTesting(true)
    const result = await testConnection({ integration: info.integration })
    setIsTesting(false)

    if (result.error) {
      toast.error(result.error.message)
    } else if (result.data?.verified) {
      toast.success(`Connection verified — ${result.data.message}`)
    } else {
      toast.error(result.data?.message ?? 'Connection failed')
    }
  }

  const handleSave = async () => {
    setIsSaving(true)

    let result
    if (info.integration === 'jira') {
      if (!jiraBaseUrl || !jiraEmail || !jiraToken) {
        toast.error('Base URL, email, and API token are required')
        setIsSaving(false)
        return
      }
      result = await saveCredentials({
        integration: 'jira',
        baseUrl: jiraBaseUrl,
        email: jiraEmail,
        apiToken: jiraToken,
        webhookSecret: jiraWebhookSecret || undefined,
      })
    } else if (info.integration === 'github') {
      if (!githubToken) {
        toast.error('OAuth token is required')
        setIsSaving(false)
        return
      }
      result = await saveCredentials({
        integration: 'github',
        oauthToken: githubToken,
        webhookSecret: githubWebhookSecret || undefined,
      })
    } else {
      if (!anthropicKey) {
        toast.error('API key is required')
        setIsSaving(false)
        return
      }
      result = await saveCredentials({
        integration: 'anthropic',
        apiKey: anthropicKey,
      })
    }

    setIsSaving(false)

    if (result?.error) {
      toast.error(result.error.message)
    } else {
      toast.success('Credentials updated successfully')
      setIsOpen(false)
      // Reset form fields
      resetForm()
    }
  }

  const resetForm = () => {
    setJiraBaseUrl('')
    setJiraEmail('')
    setJiraToken('')
    setJiraWebhookSecret('')
    setGithubToken('')
    setGithubWebhookSecret('')
    setAnthropicKey('')
  }

  const handleClose = () => {
    setIsOpen(false)
    resetForm()
  }

  return (
    <>
      {/* Buttons row */}
      <div className={hideTestButton ? undefined : 'flex gap-2 mt-1'}>
        {!hideTestButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex-1 text-sm"
          >
            {isTesting ? 'Testing…' : 'Test Connection'}
          </Button>
        )}

        <Button
          size="sm"
          onClick={() => setIsOpen(true)}
          className={hideTestButton ? 'flex-1 text-sm' : 'flex-1 text-sm'}
        >
          Configure
        </Button>
      </div>

      {/* Dialog modal */}
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure {info.name}</DialogTitle>
            <DialogDescription>
              Enter new credentials to update. Existing values are masked for security.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3.5">
            <CredentialFields
              integration={info.integration}
              masked={info.maskedCredentials}
              jiraBaseUrl={jiraBaseUrl}
              setJiraBaseUrl={setJiraBaseUrl}
              jiraEmail={jiraEmail}
              setJiraEmail={setJiraEmail}
              jiraToken={jiraToken}
              setJiraToken={setJiraToken}
              jiraWebhookSecret={jiraWebhookSecret}
              setJiraWebhookSecret={setJiraWebhookSecret}
              githubToken={githubToken}
              setGithubToken={setGithubToken}
              githubWebhookSecret={githubWebhookSecret}
              setGithubWebhookSecret={setGithubWebhookSecret}
              anthropicKey={anthropicKey}
              setAnthropicKey={setAnthropicKey}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving…' : 'Save credentials'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ──────────────────────────────────────────────────────────────
// Field components
// ──────────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  hint?: string
  type?: 'text' | 'password'
}

function FormField({ label, placeholder, value, onChange, hint, type = 'password' }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-sm font-medium">{label}</Label>
      {hint && (
        <span className="text-xs text-muted-foreground font-mono">{hint}</span>
      )}
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-muted/50"
        autoComplete="off"
      />
    </div>
  )
}

interface CredentialFieldsProps {
  integration: IntegrationType
  masked: Record<string, string>
  jiraBaseUrl: string
  setJiraBaseUrl: (v: string) => void
  jiraEmail: string
  setJiraEmail: (v: string) => void
  jiraToken: string
  setJiraToken: (v: string) => void
  jiraWebhookSecret: string
  setJiraWebhookSecret: (v: string) => void
  githubToken: string
  setGithubToken: (v: string) => void
  githubWebhookSecret: string
  setGithubWebhookSecret: (v: string) => void
  anthropicKey: string
  setAnthropicKey: (v: string) => void
}

function CredentialFields({
  integration,
  masked,
  jiraBaseUrl,
  setJiraBaseUrl,
  jiraEmail,
  setJiraEmail,
  jiraToken,
  setJiraToken,
  jiraWebhookSecret,
  setJiraWebhookSecret,
  githubToken,
  setGithubToken,
  githubWebhookSecret,
  setGithubWebhookSecret,
  anthropicKey,
  setAnthropicKey,
}: CredentialFieldsProps) {
  if (integration === 'jira') {
    return (
      <>
        <FormField
          label="Base URL"
          type="text"
          placeholder="https://yourcompany.atlassian.net"
          value={jiraBaseUrl}
          onChange={setJiraBaseUrl}
          hint={masked.baseUrl || undefined}
        />
        <FormField
          label="Email"
          type="text"
          placeholder="admin@company.com"
          value={jiraEmail}
          onChange={setJiraEmail}
          hint={masked.email || undefined}
        />
        <FormField
          label="API Token"
          placeholder="Enter new API token"
          value={jiraToken}
          onChange={setJiraToken}
          hint={masked.apiToken || undefined}
        />
        <FormField
          label="Webhook Secret (optional)"
          placeholder="Enter webhook secret"
          value={jiraWebhookSecret}
          onChange={setJiraWebhookSecret}
          hint={masked.webhookSecret || undefined}
        />
      </>
    )
  }

  if (integration === 'github') {
    return (
      <>
        <FormField
          label="OAuth Token"
          placeholder="ghp_..."
          value={githubToken}
          onChange={setGithubToken}
          hint={masked.oauthToken || undefined}
        />
        <FormField
          label="Webhook Secret (optional)"
          placeholder="Enter webhook secret"
          value={githubWebhookSecret}
          onChange={setGithubWebhookSecret}
          hint={masked.webhookSecret || undefined}
        />
      </>
    )
  }

  // anthropic
  return (
    <FormField
      label="API Key"
      placeholder="sk-ant-..."
      value={anthropicKey}
      onChange={setAnthropicKey}
      hint={masked.apiKey || undefined}
    />
  )
}
