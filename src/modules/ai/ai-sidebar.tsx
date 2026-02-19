'use client'

import { CopilotChat } from '@copilotkit/react-ui'
import '@copilotkit/react-ui/styles.css'
import { useDashboardStore } from '@/stores/use-dashboard-store'

/** Width of the AI chat sidebar in pixels. */
export const AI_SIDEBAR_WIDTH = 400

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
 */
export function AiSidebar() {
  const { isAiSidebarOpen, closeAiSidebar } = useDashboardStore()

  return (
    <>
      {/* Backdrop — closes sidebar when clicked outside */}
      {isAiSidebarOpen && (
        <div
          aria-hidden="true"
          onClick={closeAiSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 49,
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
          }}
        />
      )}

      {/* Slide-in panel */}
      <aside
        aria-label="AI assistant"
        aria-hidden={!isAiSidebarOpen}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: `${AI_SIDEBAR_WIDTH}px`,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'hsl(var(--background))',
          borderLeft: '1px solid hsl(var(--border))',
          boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.08)',
          transform: isAiSidebarOpen ? 'translateX(0)' : `translateX(${AI_SIDEBAR_WIDTH}px)`,
          transition: 'transform 0.25s ease',
          // Pointer-events: only interactive when open
          pointerEvents: isAiSidebarOpen ? 'auto' : 'none',
        }}
      >
        {/* Header */}
        <div
          style={{
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1rem',
            borderBottom: '1px solid hsl(var(--border))',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Sparkle icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-turmeric)"
              strokeWidth={1.5}
              style={{ width: '20px', height: '20px' }}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
            <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'hsl(var(--foreground))' }}>
              AI Assistant
            </span>
          </div>

          <button
            type="button"
            onClick={closeAiSidebar}
            aria-label="Close AI assistant"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'hsl(var(--foreground))',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: '18px', height: '18px' }} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat area — only render when open to avoid unnecessary rendering */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {isAiSidebarOpen && (
            <CopilotChat
              labels={{
                title: 'AI Assistant',
                initial: 'Hi! I can help you with your dashboard — sprint status, GitHub PRs, Jira issues, and more. What would you like to know?',
                placeholder: 'Ask anything about your project…',
              }}
              className="copilot-chat-panel"
            />
          )}
        </div>
      </aside>
    </>
  )
}
