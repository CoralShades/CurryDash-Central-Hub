'use client'

import { useCopilotAction } from '@copilotkit/react-core'
import { useDashboardStore } from '@/stores/use-dashboard-store'

/**
 * useCopilotActions — registers CopilotKit actions that the AI assistant can invoke.
 *
 * Actions allow the AI to perform UI interactions on behalf of the user when
 * they ask the assistant to do things like navigate to a page or open a modal.
 *
 * Each action follows the `useCopilotAction` signature from @copilotkit/react-core.
 * Actions must be registered inside a component that is a descendant of `CopilotProvider`.
 */
export function useCopilotActions() {
  const { closeAiSidebar } = useDashboardStore()

  /**
   * Dismiss the AI sidebar — useful when the user asks the assistant to
   * close the chat or go back to the dashboard.
   */
  useCopilotAction({
    name: 'dismissAiSidebar',
    description: 'Closes the AI assistant sidebar and returns focus to the dashboard.',
    parameters: [],
    handler: () => {
      closeAiSidebar()
    },
  })
}
