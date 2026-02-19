'use client'

import { useCopilotAction } from '@copilotkit/react-core'
import { useDashboardStore } from '@/stores/use-dashboard-store'
import { WidgetPreview } from './components/widget-preview'
import type { AiWidgetConfig } from '@/lib/schemas/ai-widget-schema'

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

  /**
   * generateWidget — generates and previews a dashboard widget from a natural language description (FR41, FR42).
   *
   * The AI calls this action with a widget configuration when the user asks for
   * a chart, metric, or table. The `render` callback shows a live WidgetPreview
   * inline in the chat while the action is in progress. The preview includes
   * an "Add to Dashboard" button that persists the widget via saveWidget.
   *
   * Model routing: complex (widget_creation) → Sonnet (ARCH-11).
   * Colors must use CSS custom properties from the spice palette (design-system rules).
   */
  useCopilotAction({
    name: 'generateWidget',
    description:
      'Generates a dashboard widget from a natural language description. Use this when the user asks to see a chart, metric card, or data table. Always use CSS custom properties for colors (e.g. var(--color-turmeric)) — never hardcoded hex values.',
    parameters: [
      {
        name: 'type',
        type: 'string',
        description:
          'Widget type. Must be one of: metric-card, bar-chart, line-chart, pie-chart, data-table.',
        required: true,
      },
      {
        name: 'title',
        type: 'string',
        description: 'Widget title (max 80 characters).',
        required: true,
      },
      {
        name: 'dataSource',
        type: 'string',
        description: 'Data source for the widget: jira, github, or supabase.',
        required: true,
      },
      {
        name: 'query',
        type: 'string',
        description:
          'Data query: JQL for Jira (e.g. "project = CUR AND type = Bug"), GitHub API filter, or Supabase table name.',
        required: true,
      },
      {
        name: 'colSpan',
        type: 'number',
        description: 'Grid column span for the widget. Must be one of: 3, 4, 6, or 12.',
        required: true,
      },
      {
        name: 'refreshBehavior',
        type: 'string',
        description: 'How the widget refreshes: static (never), realtime (live updates), or polling.',
        required: false,
      },
      {
        name: 'description',
        type: 'string',
        description: 'Optional description for the widget (max 200 characters).',
        required: false,
      },
      {
        name: 'primaryColor',
        type: 'string',
        description:
          'Primary chart color as a CSS custom property (e.g. var(--color-turmeric)). Never use hex values.',
        required: false,
      },
      {
        name: 'xAxisLabel',
        type: 'string',
        description: 'Label for the X axis (charts only).',
        required: false,
      },
      {
        name: 'yAxisLabel',
        type: 'string',
        description: 'Label for the Y axis (charts only).',
        required: false,
      },
    ],
    render: ({ args, status }) => {
      const config: AiWidgetConfig = {
        type: (args.type as AiWidgetConfig['type']) ?? 'metric-card',
        title: (args.title as string) ?? 'Widget',
        dataSource: (args.dataSource as AiWidgetConfig['dataSource']) ?? 'jira',
        query: (args.query as string) ?? '',
        colSpan: (args.colSpan as AiWidgetConfig['colSpan']) ?? 6,
        refreshBehavior: (args.refreshBehavior as AiWidgetConfig['refreshBehavior']) ?? 'static',
        description: args.description as string | undefined,
        displayProperties:
          args.primaryColor || args.xAxisLabel || args.yAxisLabel
            ? {
                primaryColor: args.primaryColor as string | undefined,
                xAxisLabel: args.xAxisLabel as string | undefined,
                yAxisLabel: args.yAxisLabel as string | undefined,
              }
            : undefined,
      }

      return <WidgetPreview config={config} status={status} />
    },
    handler: async () => {
      return 'Widget preview generated. Click "Add to dashboard" to save it to your dashboard.'
    },
  })
}
