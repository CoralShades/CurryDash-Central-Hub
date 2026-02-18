'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div role="alert" className="flex flex-col items-center justify-center gap-3 p-6 text-center">
            <p style={{ color: 'var(--color-chili)', fontSize: '0.875rem' }}>Something went wrong</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="rounded px-3 py-1.5 text-sm transition-colors hover:opacity-80"
              style={{
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'transparent',
              }}
            >
              Try again
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
