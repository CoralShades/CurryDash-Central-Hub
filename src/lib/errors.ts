export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly data?: unknown
  ) {
    super(message)
    this.name = 'AppError'
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class AuthError extends AppError {
  constructor(message: string, data?: unknown) {
    super('AUTH_ERROR', message, data)
    this.name = 'AuthError'
    Object.setPrototypeOf(this, AuthError.prototype)
  }
}

export class IntegrationError extends AppError {
  constructor(message: string, data?: unknown) {
    super('INTEGRATION_ERROR', message, data)
    this.name = 'IntegrationError'
    Object.setPrototypeOf(this, IntegrationError.prototype)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, data?: unknown) {
    super('VALIDATION_ERROR', message, data)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string, data?: unknown) {
    super('RATE_LIMIT_ERROR', message, data)
    this.name = 'RateLimitError'
    Object.setPrototypeOf(this, RateLimitError.prototype)
  }
}
