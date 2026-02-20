'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { testConnection } from '@/modules/admin/actions/configure-integration'
import type { IntegrationInfo } from '@/modules/admin/actions/configure-integration'
import { IntegrationConfigForm } from './integration-config-form'
import { IntegrationSetupWizard } from './integration-setup-wizard'

interface IntegrationCardActionsProps {
  info: IntegrationInfo
}

const WIZARD_INTEGRATIONS = new Set(['jira', 'github'])

/**
 * IntegrationCardActions — Client Component
 * Renders three action buttons per integration card:
 * - Test Connection (inline, shows toast result)
 * - Configure (opens credential modal via IntegrationConfigForm)
 * - Setup / Re-sync (opens 4-step wizard; only for jira + github)
 */
export function IntegrationCardActions({ info }: IntegrationCardActionsProps) {
  const router = useRouter()
  const [isTesting, setIsTesting] = useState(false)
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  const supportsWizard = WIZARD_INTEGRATIONS.has(info.integration)
  const isDisconnected = info.status === 'disconnected'

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

  const handleWizardComplete = () => {
    router.refresh()
  }

  return (
    <>
      <div className="flex flex-col gap-2 mt-1">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex-1 text-sm"
            data-testid={`test-connection-${info.integration}`}
          >
            {isTesting ? 'Testing…' : 'Test Connection'}
          </Button>

          {/* Configure — opens credential modal */}
          <IntegrationConfigForm info={info} hideTestButton />
        </div>

        {supportsWizard && (
          <Button
            size="sm"
            onClick={() => setIsWizardOpen(true)}
            disabled={isDisconnected}
            className="w-full text-sm"
            data-testid={`setup-btn-${info.integration}`}
          >
            {info.lastSyncAt ? 'Re-sync' : 'Setup'}
          </Button>
        )}
      </div>

      {supportsWizard && (
        <IntegrationSetupWizard
          info={info}
          open={isWizardOpen}
          onOpenChange={setIsWizardOpen}
          onComplete={handleWizardComplete}
        />
      )}
    </>
  )
}
