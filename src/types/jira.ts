export interface JiraProject {
  id: string
  key: string
  name: string
  description?: string
  avatarUrls?: Record<string, string>
}

export interface JiraSprint {
  id: number
  name: string
  state: 'active' | 'closed' | 'future'
  startDate?: string
  endDate?: string
  goal?: string
  originBoardId?: number
}

export interface JiraIssue {
  id: string
  key: string
  summary: string
  status: string
  priority?: string
  assignee?: {
    emailAddress: string
    displayName: string
    avatarUrls?: Record<string, string>
  }
  issueType: string
  sprint?: JiraSprint
  epicKey?: string
  storyPoints?: number
  created: string
  updated: string
  rawPayload?: Record<string, unknown>
}

export interface JiraEpic {
  id: string
  key: string
  name: string
  summary: string
  status: string
  color?: string
}

export interface JiraWebhookEvent {
  webhookEvent: string
  issue?: {
    id: string
    key: string
    fields: Record<string, unknown>
  }
  changelog?: {
    items: Array<{
      field: string
      fromString?: string
      toString?: string
    }>
  }
  user?: {
    emailAddress: string
    displayName: string
  }
  timestamp: number
}

export interface JiraSprintProgress {
  sprint: JiraSprint
  total: number
  done: number
  inProgress: number
  toDo: number
  blocked: number
  completionPercent: number
}
