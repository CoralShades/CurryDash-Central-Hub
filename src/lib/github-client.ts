/**
 * GitHub API Client
 * Handles interactions with GitHub REST API
 */

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description?: string
  html_url: string
  default_branch: string
  created_at: string
  updated_at: string
  language?: string
  stargazers_count: number
  forks_count: number
}

export interface GitHubPullRequest {
  id: number
  number: number
  title: string
  body?: string
  state: 'open' | 'closed'
  html_url: string
  created_at: string
  updated_at: string
  user: {
    login: string
    avatar_url: string
  }
  head: {
    ref: string
    sha: string
  }
  base: {
    ref: string
    sha: string
  }
  draft: boolean
  merged: boolean
}

export interface GitHubIssue {
  id: number
  number: number
  title: string
  body?: string
  state: 'open' | 'closed'
  html_url: string
  created_at: string
  updated_at: string
  user: {
    login: string
    avatar_url: string
  }
  labels: Array<{
    name: string
    color: string
  }>
  assignees: Array<{
    login: string
    avatar_url: string
  }>
}

export class GitHubClient {
  private token: string
  private baseUrl: string = 'https://api.github.com'

  constructor(token: string) {
    this.token = token
  }

  /**
   * Get authentication headers for GitHub API
   */
  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }
  }

  /**
   * Get a repository
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * List pull requests for a repository
   */
  async listPullRequests(
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'open'
  ): Promise<GitHubPullRequest[]> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/pulls?state=${state}&per_page=100`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get a specific pull request
   */
  async getPullRequest(owner: string, repo: string, prNumber: number): Promise<GitHubPullRequest> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * List issues for a repository
   */
  async listIssues(
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'open'
  ): Promise<GitHubIssue[]> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/issues?state=${state}&per_page=100`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get a specific issue
   */
  async getIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Create an issue
   */
  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body?: string,
    labels?: string[]
  ): Promise<GitHubIssue> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/issues`
    const requestBody = JSON.stringify({
      title,
      body,
      labels,
    })

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: requestBody,
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * List repositories for the authenticated user
   */
  async listMyRepositories(): Promise<GitHubRepository[]> {
    const url = `${this.baseUrl}/user/repos?per_page=100&sort=updated`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }
}

/**
 * Factory function to create a GitHub client from environment variables
 */
export function createGitHubClient(): GitHubClient {
  const token = process.env.GITHUB_TOKEN

  if (!token) {
    throw new Error('GitHub configuration missing. Please set GITHUB_TOKEN environment variable.')
  }

  return new GitHubClient(token)
}
