/**
 * Supabase database types matching supabase/migrations/20260218000001_initial_schema.sql
 * Run `supabase gen types typescript` to regenerate after schema changes.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string
          name: string
          display_name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          created_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'users_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['id']
          }
        ]
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'team_members_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'team_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      jira_projects: {
        Row: {
          id: string
          project_key: string
          name: string
          description: string | null
          jira_id: string
          lead_email: string | null
          synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_key: string
          name: string
          description?: string | null
          jira_id: string
          lead_email?: string | null
          synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_key?: string
          name?: string
          description?: string | null
          jira_id?: string
          lead_email?: string | null
          synced_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      jira_sprints: {
        Row: {
          id: string
          sprint_id: string
          project_id: string
          name: string
          state: string
          start_date: string | null
          end_date: string | null
          goal: string | null
          synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sprint_id: string
          project_id: string
          name: string
          state: string
          start_date?: string | null
          end_date?: string | null
          goal?: string | null
          synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sprint_id?: string
          project_id?: string
          name?: string
          state?: string
          start_date?: string | null
          end_date?: string | null
          goal?: string | null
          synced_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'jira_sprints_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'jira_projects'
            referencedColumns: ['id']
          }
        ]
      }
      jira_issues: {
        Row: {
          id: string
          issue_key: string
          project_id: string
          sprint_id: string | null
          summary: string
          description: string | null
          issue_type: string
          status: string
          priority: string | null
          assignee_email: string | null
          reporter_email: string | null
          story_points: number | null
          labels: string[]
          jira_created_at: string | null
          jira_updated_at: string | null
          synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          issue_key: string
          project_id: string
          sprint_id?: string | null
          summary: string
          description?: string | null
          issue_type: string
          status: string
          priority?: string | null
          assignee_email?: string | null
          reporter_email?: string | null
          story_points?: number | null
          labels?: string[]
          jira_created_at?: string | null
          jira_updated_at?: string | null
          synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          issue_key?: string
          project_id?: string
          sprint_id?: string | null
          summary?: string
          description?: string | null
          issue_type?: string
          status?: string
          priority?: string | null
          assignee_email?: string | null
          reporter_email?: string | null
          story_points?: number | null
          labels?: string[]
          jira_created_at?: string | null
          jira_updated_at?: string | null
          synced_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'jira_issues_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'jira_projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'jira_issues_sprint_id_fkey'
            columns: ['sprint_id']
            isOneToOne: false
            referencedRelation: 'jira_sprints'
            referencedColumns: ['id']
          }
        ]
      }
      github_repos: {
        Row: {
          id: string
          repo_id: number
          full_name: string
          name: string
          description: string | null
          default_branch: string
          is_private: boolean
          language: string | null
          stars_count: number
          open_issues_count: number
          synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          repo_id: number
          full_name: string
          name: string
          description?: string | null
          default_branch?: string
          is_private?: boolean
          language?: string | null
          stars_count?: number
          open_issues_count?: number
          synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          repo_id?: number
          full_name?: string
          name?: string
          description?: string | null
          default_branch?: string
          is_private?: boolean
          language?: string | null
          stars_count?: number
          open_issues_count?: number
          synced_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      github_workflow_runs: {
        Row: {
          id: string
          run_id: number
          github_repo_id: string
          workflow_name: string
          workflow_id: number | null
          head_branch: string | null
          head_sha: string | null
          event: string | null
          status: string
          conclusion: string | null
          html_url: string | null
          run_number: number | null
          duration_seconds: number | null
          raw_payload: Json
          github_created_at: string | null
          github_updated_at: string | null
          synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          run_id: number
          github_repo_id: string
          workflow_name: string
          workflow_id?: number | null
          head_branch?: string | null
          head_sha?: string | null
          event?: string | null
          status: string
          conclusion?: string | null
          html_url?: string | null
          run_number?: number | null
          duration_seconds?: number | null
          raw_payload?: Json
          github_created_at?: string | null
          github_updated_at?: string | null
          synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          run_id?: number
          github_repo_id?: string
          workflow_name?: string
          workflow_id?: number | null
          head_branch?: string | null
          head_sha?: string | null
          event?: string | null
          status?: string
          conclusion?: string | null
          html_url?: string | null
          run_number?: number | null
          duration_seconds?: number | null
          raw_payload?: Json
          github_created_at?: string | null
          github_updated_at?: string | null
          synced_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'github_workflow_runs_github_repo_id_fkey'
            columns: ['github_repo_id']
            isOneToOne: false
            referencedRelation: 'github_repos'
            referencedColumns: ['id']
          }
        ]
      }
      github_commit_activity: {
        Row: {
          id: string
          github_repo_id: string
          commit_date: string
          commit_count: number
          author_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          github_repo_id: string
          commit_date: string
          commit_count?: number
          author_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          github_repo_id?: string
          commit_date?: string
          commit_count?: number
          author_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'github_commit_activity_github_repo_id_fkey'
            columns: ['github_repo_id']
            isOneToOne: false
            referencedRelation: 'github_repos'
            referencedColumns: ['id']
          }
        ]
      }
      github_pull_requests: {
        Row: {
          id: string
          pr_number: number
          repo_id: string
          title: string
          state: string
          author_login: string
          author_avatar_url: string | null
          head_branch: string
          base_branch: string
          is_draft: boolean
          additions: number
          deletions: number
          changed_files: number
          merged_at: string | null
          raw_payload: Json
          github_created_at: string | null
          github_updated_at: string | null
          synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pr_number: number
          repo_id: string
          title: string
          state: string
          author_login: string
          author_avatar_url?: string | null
          head_branch: string
          base_branch: string
          is_draft?: boolean
          additions?: number
          deletions?: number
          changed_files?: number
          merged_at?: string | null
          raw_payload?: Json
          github_created_at?: string | null
          github_updated_at?: string | null
          synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pr_number?: number
          repo_id?: string
          title?: string
          state?: string
          author_login?: string
          author_avatar_url?: string | null
          head_branch?: string
          base_branch?: string
          is_draft?: boolean
          additions?: number
          deletions?: number
          changed_files?: number
          merged_at?: string | null
          raw_payload?: Json
          github_created_at?: string | null
          github_updated_at?: string | null
          synced_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'github_pull_requests_repo_id_fkey'
            columns: ['repo_id']
            isOneToOne: false
            referencedRelation: 'github_repos'
            referencedColumns: ['id']
          }
        ]
      }
      webhook_events: {
        Row: {
          id: string
          source: string
          event_type: string
          event_id: string
          payload: Json
          processed: boolean
          processed_at: string | null
          error: string | null
          correlation_id: string
          created_at: string
        }
        Insert: {
          id?: string
          source: string
          event_type: string
          event_id: string
          payload: Json
          processed?: boolean
          processed_at?: string | null
          error?: string | null
          correlation_id: string
          created_at?: string
        }
        Update: {
          id?: string
          source?: string
          event_type?: string
          event_id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          error?: string | null
          correlation_id?: string
          created_at?: string
        }
        Relationships: []
      }
      dead_letter_events: {
        Row: {
          id: string
          source: string
          event_type: string
          event_id: string | null
          payload: Json
          error: string
          retry_count: number
          last_retry_at: string | null
          correlation_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          source: string
          event_type: string
          event_id?: string | null
          payload: Json
          error: string
          retry_count?: number
          last_retry_at?: string | null
          correlation_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          source?: string
          event_type?: string
          event_id?: string | null
          payload?: Json
          error?: string
          retry_count?: number
          last_retry_at?: string | null
          correlation_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      dashboard_widgets: {
        Row: {
          id: string
          user_id: string
          widget_type: string
          position: number
          config: Json
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          widget_type: string
          position?: number
          config?: Json
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          widget_type?: string
          position?: number
          config?: Json
          is_visible?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'dashboard_widgets_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          action_url: string | null
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          is_read?: boolean
          action_url?: string | null
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          is_read?: boolean
          action_url?: string | null
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      ai_chat_sessions: {
        Row: {
          id: string
          user_id: string
          messages: Json
          context: Json
          token_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          messages?: Json
          context?: Json
          token_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          messages?: Json
          context?: Json
          token_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ai_chat_sessions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      system_health: {
        Row: {
          id: string
          service: string
          status: string
          latency_ms: number | null
          checked_at: string
          created_at: string
        }
        Insert: {
          id?: string
          service: string
          status: string
          latency_ms?: number | null
          checked_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          service?: string
          status?: string
          latency_ms?: number | null
          checked_at?: string
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          id: string
          user_id: string | null
          model: string
          prompt_tokens: number
          completion_tokens: number
          total_tokens: number
          estimated_cost_usd: number
          request_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          model: string
          prompt_tokens: number
          completion_tokens: number
          total_tokens: number
          estimated_cost_usd: number
          request_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          model?: string
          prompt_tokens?: number
          completion_tokens?: number
          total_tokens?: number
          estimated_cost_usd?: number
          request_type?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ai_usage_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: 'admin' | 'developer' | 'qa' | 'stakeholder'
    }
  }
}

export type UserRole = Database['public']['Enums']['user_role']

// Convenience row types
export type DbUser = Database['public']['Tables']['users']['Row']
export type DbRole = Database['public']['Tables']['roles']['Row']
export type DbTeam = Database['public']['Tables']['teams']['Row']
export type DbJiraProject = Database['public']['Tables']['jira_projects']['Row']
export type DbJiraIssue = Database['public']['Tables']['jira_issues']['Row']
export type DbGithubRepo = Database['public']['Tables']['github_repos']['Row']
export type DbGithubPR = Database['public']['Tables']['github_pull_requests']['Row']
export type DbGithubWorkflowRun = Database['public']['Tables']['github_workflow_runs']['Row']
export type DbGithubCommitActivity = Database['public']['Tables']['github_commit_activity']['Row']
export type DbWebhookEvent = Database['public']['Tables']['webhook_events']['Row']
export type DbDeadLetterEvent = Database['public']['Tables']['dead_letter_events']['Row']
export type DbNotification = Database['public']['Tables']['notifications']['Row']
export type DbSystemHealth = Database['public']['Tables']['system_health']['Row']
export type DbAiUsage = Database['public']['Tables']['ai_usage']['Row']
