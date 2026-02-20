'use client'

import { useState } from 'react'
import type { ProjectProgress } from './sprint-progress-widget'
import { SprintDetailView } from './sprint-detail-view'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface SprintProgressCardProps {
  projects: ProjectProgress[]
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function percentColorClass(percent: number): string {
  if (percent >= 80) return 'text-coriander'
  if (percent >= 50) return 'text-turmeric'
  return 'text-chili'
}

/**
 * SprintProgressCard — Client Component for interactive sprint progress list.
 * Handles drill-down click → SprintDetailView overlay.
 */
export function SprintProgressCard({ projects }: SprintProgressCardProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectProgress | null>(null)

  return (
    <>
      <div className="flex-1 overflow-y-auto flex flex-col gap-3">
        {projects.map((project) => {
          const percent =
            project.totalIssues > 0
              ? Math.round((project.completedIssues / project.totalIssues) * 100)
              : 0

          return (
            <button
              key={project.projectKey}
              onClick={() => setSelectedProject(project)}
              className="block w-full text-left p-3 bg-muted/50 border border-border rounded-[var(--radius-sm)] cursor-pointer transition-colors hover:bg-muted"
              aria-label={`View sprint detail for ${project.projectName}`}
            >
              {/* Project header row */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-bold text-muted-foreground">
                    {project.projectKey}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1.5">
                    {project.sprintName !== 'No active sprint'
                      ? `${formatDate(project.startDate)} – ${formatDate(project.endDate)}`
                      : 'No active sprint'}
                  </span>
                </div>
                <span className={cn('text-sm font-semibold', percentColorClass(percent))}>
                  {percent}%
                </span>
              </div>

              {/* Progress bar */}
              <Progress
                value={percent}
                className="h-1.5"
                aria-label={`${project.projectName} sprint progress`}
              />

              {/* Story counts */}
              <div className="flex justify-between mt-1">
                <span className="text-[0.6875rem] text-muted-foreground">
                  {project.completedIssues}/{project.totalIssues} stories
                </span>
                {project.totalPoints > 0 && (
                  <span className="text-[0.6875rem] text-muted-foreground">
                    {project.completedPoints}/{project.totalPoints} pts
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Drill-down detail overlay */}
      {selectedProject && (
        <SprintDetailView
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  )
}
