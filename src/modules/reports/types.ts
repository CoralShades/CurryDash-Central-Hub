import type { Role } from '@/types/roles'

export interface GeneratedReport {
  content: string
  generatedAt: string
  role: Role
}

export type ReportHealthIndicator = 'On Track' | 'At Risk' | 'Behind'
