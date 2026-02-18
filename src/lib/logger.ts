type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type LogSource = 'webhook:jira' | 'webhook:github' | 'auth' | 'ai' | 'realtime' | 'admin'

interface LogEntry {
  level: LogLevel
  message: string
  correlationId?: string
  source?: LogSource
  timestamp: string
  data?: unknown
}

function log(level: LogLevel, message: string, meta?: Omit<LogEntry, 'level' | 'message' | 'timestamp'>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  }

  // In production, use structured logging service. For now, console output.
  if (level === 'error') {
    console.error(JSON.stringify(entry))
  } else if (level === 'warn') {
    console.warn(JSON.stringify(entry))
  } else if (process.env.NODE_ENV !== 'production' || level === 'info') {
    console.log(JSON.stringify(entry))
  }
}

export const logger = {
  debug: (message: string, meta?: Omit<LogEntry, 'level' | 'message' | 'timestamp'>) =>
    log('debug', message, meta),
  info: (message: string, meta?: Omit<LogEntry, 'level' | 'message' | 'timestamp'>) =>
    log('info', message, meta),
  warn: (message: string, meta?: Omit<LogEntry, 'level' | 'message' | 'timestamp'>) =>
    log('warn', message, meta),
  error: (message: string, meta?: Omit<LogEntry, 'level' | 'message' | 'timestamp'>) =>
    log('error', message, meta),
}
