/**
 * Jira API Client
 * Handles interactions with Jira Cloud REST API
 */

export interface JiraIssue {
  id: string
  key: string
  fields: {
    summary: string
    description?: string
    status: {
      name: string
    }
    assignee?: {
      displayName: string
      emailAddress: string
    }
    priority?: {
      name: string
    }
    created: string
    updated: string
  }
}

export interface JiraSearchResult {
  issues: JiraIssue[]
  total: number
  maxResults: number
  startAt: number
}

export class JiraClient {
  private baseUrl: string
  private email: string
  private apiToken: string

  constructor(baseUrl: string, email: string, apiToken: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.email = email
    this.apiToken = apiToken
  }

  /**
   * Get authentication headers for Jira API
   */
  private getHeaders(): HeadersInit {
    const auth = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64')
    return {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }

  /**
   * Search for issues using JQL
   */
  async searchIssues(jql: string, maxResults: number = 50): Promise<JiraSearchResult> {
    const url = `${this.baseUrl}/rest/api/3/search`
    const body = JSON.stringify({
      jql,
      maxResults,
      fields: ['summary', 'description', 'status', 'assignee', 'priority', 'created', 'updated'],
    })

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body,
    })

    if (!response.ok) {
      throw new Error(`Jira API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get a specific issue by key
   */
  async getIssue(issueKey: string): Promise<JiraIssue> {
    const url = `${this.baseUrl}/rest/api/3/issue/${issueKey}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Jira API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Create a new issue
   */
  async createIssue(projectKey: string, summary: string, description?: string): Promise<JiraIssue> {
    const url = `${this.baseUrl}/rest/api/3/issue`
    const body = JSON.stringify({
      fields: {
        project: { key: projectKey },
        summary,
        description: description ? {
          type: 'doc',
          version: 1,
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: description }]
          }]
        } : undefined,
        issuetype: { name: 'Task' },
      },
    })

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body,
    })

    if (!response.ok) {
      throw new Error(`Jira API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Update an issue
   */
  async updateIssue(issueKey: string, fields: Partial<JiraIssue['fields']>): Promise<void> {
    const url = `${this.baseUrl}/rest/api/3/issue/${issueKey}`
    const body = JSON.stringify({ fields })

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body,
    })

    if (!response.ok) {
      throw new Error(`Jira API error: ${response.status} ${response.statusText}`)
    }
  }

  /**
   * Get issues assigned to current user
   */
  async getMyIssues(): Promise<JiraSearchResult> {
    return this.searchIssues('assignee = currentUser() AND resolution = Unresolved ORDER BY updated DESC')
  }
}

/**
 * Factory function to create a Jira client from environment variables
 */
export function createJiraClient(): JiraClient {
  const baseUrl = process.env.JIRA_BASE_URL
  const email = process.env.JIRA_EMAIL
  const apiToken = process.env.JIRA_API_TOKEN

  if (!baseUrl || !email || !apiToken) {
    throw new Error('Jira configuration missing. Please set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN environment variables.')
  }

  return new JiraClient(baseUrl, email, apiToken)
}
