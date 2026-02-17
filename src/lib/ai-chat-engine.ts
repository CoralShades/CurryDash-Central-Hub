/**
 * AI Chat Engine
 * Handles interactions with AI services for intelligent chat assistance
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  context?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface AIResponse {
  message: string
  suggestions?: string[]
  metadata?: Record<string, any>
}

export class AIChatEngine {
  private apiKey: string
  private apiEndpoint: string
  private model: string
  private sessions: Map<string, ChatSession>

  constructor(apiKey: string, apiEndpoint: string = 'https://api.anthropic.com/v1/messages', model: string = 'claude-3-sonnet-20240229') {
    this.apiKey = apiKey
    this.apiEndpoint = apiEndpoint
    this.model = model
    this.sessions = new Map()
  }

  /**
   * Create a new chat session
   */
  createSession(systemPrompt?: string): ChatSession {
    const session: ChatSession = {
      id: this.generateSessionId(),
      messages: systemPrompt ? [{ role: 'system', content: systemPrompt, timestamp: new Date() }] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    this.sessions.set(session.id, session)
    return session
  }

  /**
   * Get an existing session
   */
  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId)
  }

  /**
   * Send a message in a chat session
   */
  async sendMessage(sessionId: string, message: string, context?: Record<string, any>): Promise<AIResponse> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    // Add user message to session
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    }
    session.messages.push(userMessage)

    // Update session context if provided
    if (context) {
      session.context = { ...session.context, ...context }
    }

    try {
      // Call AI API
      const response = await this.callAIAPI(session)
      
      // Add assistant response to session
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      }
      session.messages.push(assistantMessage)
      session.updatedAt = new Date()

      return response
    } catch (error) {
      console.error('AI API error:', error)
      throw new Error('Failed to get AI response')
    }
  }

  /**
   * Call the AI API with session messages
   */
  private async callAIAPI(session: ChatSession): Promise<AIResponse> {
    // Extract system message if present
    const systemMessage = session.messages.find(m => m.role === 'system')
    const conversationMessages = session.messages.filter(m => m.role !== 'system')

    // Build request payload
    const payload = {
      model: this.model,
      max_tokens: 1024,
      system: systemMessage?.content,
      messages: conversationMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }

    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      message: data.content[0].text,
      metadata: {
        model: data.model,
        usage: data.usage,
      },
    }
  }

  /**
   * Get chat history for a session
   */
  getHistory(sessionId: string): ChatMessage[] {
    const session = this.sessions.get(sessionId)
    return session ? [...session.messages] : []
  }

  /**
   * Clear a session
   */
  clearSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId)
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * Get specialized prompt for project management tasks
   */
  static getProjectManagementPrompt(role: 'admin' | 'dev' | 'qa' | 'stakeholder'): string {
    const prompts = {
      admin: 'You are an AI assistant specialized in project administration and team management. Help with user management, system configuration, and administrative tasks.',
      dev: 'You are an AI assistant specialized in software development. Help with coding questions, debugging, code reviews, and technical problem-solving.',
      qa: 'You are an AI assistant specialized in quality assurance and testing. Help with test planning, bug reporting, test automation, and quality metrics.',
      stakeholder: 'You are an AI assistant specialized in project oversight and business analysis. Help with project status, metrics interpretation, and strategic insights.',
    }
    return prompts[role]
  }
}

/**
 * Factory function to create an AI chat engine from environment variables
 */
export function createAIChatEngine(): AIChatEngine {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const apiEndpoint = process.env.AI_API_ENDPOINT
  const model = process.env.AI_MODEL

  if (!apiKey) {
    throw new Error('AI configuration missing. Please set ANTHROPIC_API_KEY environment variable.')
  }

  return new AIChatEngine(apiKey, apiEndpoint, model)
}
