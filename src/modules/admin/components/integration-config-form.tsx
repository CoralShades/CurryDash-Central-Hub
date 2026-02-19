'use client'

import { useState } from 'react'
import { testConnection, saveCredentials } from '@/modules/admin/actions/configure-integration'
import type { IntegrationInfo } from '@/modules/admin/actions/configure-integration'
import type { IntegrationType } from '@/modules/admin/schemas/integration-schema'

interface IntegrationConfigFormProps {
  info: IntegrationInfo
}

interface Toast {
  message: string
  type: 'success' | 'error'
}

/**
 * IntegrationConfigForm — Client Component
 * Renders the "Configure" button that opens a credential entry modal
 * and a "Test Connection" button. Credentials are submitted via server actions.
 * API keys are never exposed — only masked hints from server are shown.
 */
export function IntegrationConfigForm({ info }: IntegrationConfigFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  // Form field state — empty means "keep existing"
  const [jiraBaseUrl, setJiraBaseUrl] = useState('')
  const [jiraEmail, setJiraEmail] = useState('')
  const [jiraToken, setJiraToken] = useState('')
  const [jiraWebhookSecret, setJiraWebhookSecret] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [githubWebhookSecret, setGithubWebhookSecret] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    const result = await testConnection({ integration: info.integration })
    setIsTesting(false)

    if (result.error) {
      showToast(result.error.message, 'error')
    } else if (result.data?.verified) {
      showToast(`Connection verified — ${result.data.message}`, 'success')
    } else {
      showToast(result.data?.message ?? 'Connection failed', 'error')
    }
  }

  const handleSave = async () => {
    setIsSaving(true)

    let result
    if (info.integration === 'jira') {
      if (!jiraBaseUrl || !jiraEmail || !jiraToken) {
        showToast('Base URL, email, and API token are required', 'error')
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
        showToast('OAuth token is required', 'error')
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
        showToast('API key is required', 'error')
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
      showToast(result.error.message, 'error')
    } else {
      showToast('Credentials updated successfully', 'success')
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
    setToast(null)
  }

  return (
    <>
      {/* Buttons row */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <button
          onClick={handleTestConnection}
          disabled={isTesting}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: isTesting ? 'not-allowed' : 'pointer',
            backgroundColor: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            color: isTesting ? '#9ca3af' : 'var(--color-foreground)',
            transition: 'background-color 0.15s',
          }}
        >
          {isTesting ? 'Testing…' : 'Test Connection'}
        </button>

        <button
          onClick={() => setIsOpen(true)}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            backgroundColor: 'var(--color-foreground)',
            color: 'var(--color-background)',
            border: 'none',
            borderRadius: '6px',
            transition: 'opacity 0.15s',
          }}
        >
          Configure
        </button>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          style={{
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            backgroundColor:
              toast.type === 'success' ? 'rgba(74,124,89,0.12)' : 'rgba(197,53,31,0.12)',
            color:
              toast.type === 'success' ? 'var(--color-coriander)' : 'var(--color-chili)',
            border: `1px solid ${toast.type === 'success' ? 'var(--color-coriander)' : 'var(--color-chili)'}`,
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Modal overlay */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Configure ${info.name}`}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={handleClose}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          />

          {/* Dialog panel */}
          <div
            style={{
              position: 'relative',
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '28px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 700 }}>
              Configure {info.name}
            </h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#6b7280' }}>
              Enter new credentials to update. Existing values are masked for security.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

            <div
              style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}
            >
              <button
                onClick={handleClose}
                style={{
                  padding: '9px 18px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  color: 'var(--color-foreground)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: '9px 18px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  backgroundColor: isSaving ? '#9ca3af' : 'var(--color-foreground)',
                  color: 'var(--color-background)',
                  border: 'none',
                  borderRadius: '6px',
                }}
              >
                {isSaving ? 'Saving…' : 'Save credentials'}
              </button>
            </div>
          </div>
        </div>
      )}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>{label}</label>
      {hint && (
        <span style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>{hint}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: '8px 12px',
          fontSize: '14px',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          backgroundColor: '#f9fafb',
        }}
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
