'use client'

import { CopilotChat } from '@copilotkit/react-ui'
import '@copilotkit/react-ui/styles.css'
import { Sparkles, X } from 'lucide-react'
import { useDashboardStore } from '@/stores/use-dashboard-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AI_UNAVAILABLE_MESSAGE } from './ai-status'

/** Width of the AI chat sidebar in pixels. */
export const AI_SIDEBAR_WIDTH = 400

/** Fallback body shown in the sidebar when the AI backend is unreachable. */
export const AI_UNAVAILABLE_FALLBACK =
  'The AI assistant is temporarily unavailable. Your dashboard continues to work fully — all Jira data, GitHub data, charts, and navigation are unaffected.'

/**
 * AiSidebar — slide-in chat panel controlled by useDashboardStore.
 *
 * Renders as a fixed overlay sliding in from the right edge of the viewport.
 * Open/close state is driven by isAiSidebarOpen in useDashboardStore so that
 * the Cmd+K keyboard shortcut in PageHeader keeps the source of truth in the
 * store, not inside CopilotKit's own internal state.
 *
 * Uses CopilotChat (headless) rather than CopilotSidebar so we fully control
 * the panel visibility, width, and slide animation.
 *
 * When isAiAvailable is false, shows a friendly unavailability message instead
 * of the chat interface so the sidebar never crashes due to AI issues.
 */
export function AiSidebar() {
  const { isAiSidebarOpen, closeAiSidebar, isAiAvailable } = useDashboardStore()

  return (
    <>
      {/* Backdrop — closes sidebar when clicked outside */}
      {isAiSidebarOpen && (
        <div
          aria-hidden="true"
          onClick={closeAiSidebar}
          className="fixed inset-0 z-49 bg-black/15"
        />
      )}

      {/* Slide-in panel */}
      <aside
        aria-label="AI assistant"
        aria-hidden={!isAiSidebarOpen}
        style={{ width: `${AI_SIDEBAR_WIDTH}px` }}
        className={cn(
          'fixed top-0 right-0 bottom-0 z-50 flex flex-col',
          'bg-background border-l border-border shadow-[-4px_0_16px_rgba(0,0,0,0.08)]',
          'transition-transform duration-300',
          isAiSidebarOpen
            ? 'translate-x-0 pointer-events-auto'
            : 'translate-x-full pointer-events-none',
        )}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            {/* Sparkle icon — muted when unavailable */}
            <Sparkles
              className={cn(
                'h-5 w-5',
                isAiAvailable ? 'text-[var(--color-turmeric)]' : 'text-muted-foreground',
              )}
              aria-hidden="true"
            />
            <span className="font-semibold text-[0.9375rem] text-foreground">
              AI Assistant
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={closeAiSidebar}
            aria-label="Close AI assistant"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Chat area — only render when open to avoid unnecessary rendering */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {isAiSidebarOpen && (
            isAiAvailable ? (
              <CopilotChat
                labels={{
                  title: 'AI Assistant',
                  initial: 'Hi! I can help you with your dashboard — sprint status, GitHub PRs, Jira issues, and more. What would you like to know?',
                  placeholder: 'Ask anything about your project…',
                }}
                className="copilot-chat-panel"
              />
            ) : (
              <div
                role="status"
                aria-live="polite"
                className="flex flex-col items-center justify-center flex-1 px-6 py-8 gap-3 text-center text-muted-foreground"
              >
                {/* Muted sparkle icon */}
                <Sparkles
                  className="h-10 w-10 opacity-40"
                  aria-hidden="true"
                />
                <p className="font-semibold text-[0.9375rem] text-foreground m-0">
                  {AI_UNAVAILABLE_MESSAGE}
                </p>
                <p className="text-sm m-0 leading-relaxed">
                  {AI_UNAVAILABLE_FALLBACK}
                </p>
              </div>
            )
          )}
        </div>
      </aside>
    </>
  )
}
