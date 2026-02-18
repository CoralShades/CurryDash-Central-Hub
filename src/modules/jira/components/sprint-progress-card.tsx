'use client'

import { useState } from 'react'
import type { ProjectProgress } from './sprint-progress-widget'
import { SprintDetailView } from './sprint-detail-view'

interface SprintProgressCardProps {
  projects: ProjectProgress[]
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

/**
 * SprintProgressCard — Client Component for interactive sprint progress list.
 * Handles drill-down click → SprintDetailView overlay.
 */
export function SprintProgressCard({ projects }: SprintProgressCardProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectProgress | null>(null)

  return (
    <>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        {projects.map((project) => {
          const percent =
            project.totalIssues > 0
              ? Math.round((project.completedIssues / project.totalIssues) * 100)
              : 0

          return (
            <button
              key={project.projectKey}
              onClick={() => setSelectedProject(project)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
              aria-label={`View sprint detail for ${project.projectName}`}
            >
              {/* Project header row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-2)',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {project.projectKey}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                      marginLeft: '0.375rem',
                    }}
                  >
                    {project.sprintName !== 'No active sprint'
                      ? `${formatDate(project.startDate)} – ${formatDate(project.endDate)}`
                      : 'No active sprint'}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: percent >= 80 ? 'var(--color-coriander)' : percent >= 50 ? 'var(--color-turmeric)' : 'var(--color-chili)',
                  }}
                >
                  {percent}%
                </span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: '6px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--color-border-subtle)',
                  overflow: 'hidden',
                }}
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${percent}%`,
                    borderRadius: '999px',
                    backgroundColor: percent >= 80
                      ? 'var(--color-coriander)'
                      : percent >= 50
                        ? 'var(--color-turmeric)'
                        : 'var(--color-chili)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              {/* Story counts */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 'var(--space-1)',
                }}
              >
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                  {project.completedIssues}/{project.totalIssues} stories
                </span>
                {project.totalPoints > 0 && (
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
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
