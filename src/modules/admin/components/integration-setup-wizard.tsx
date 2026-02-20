'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { testConnection } from '@/modules/admin/actions/configure-integration'
import {
  listJiraProjects,
  syncJiraData,
  listGitHubRepos,
  syncGitHubData,
  type JiraSyncResult,
  type GitHubSyncResult,
} from '@/modules/admin/actions/sync-integration'
import type { IntegrationInfo } from '@/modules/admin/actions/configure-integration'
import type { JiraProject } from '@/types/jira'
import type { GitHubRepo } from '@/types/github'

// ── Types ──────────────────────────────────────────────────────────────────

type WizardStep =
  | { id: 'connect' }
  | { id: 'test'; testing: boolean; message: string | null; verified: boolean }
  | { id: 'select' }
  | { id: 'sync'; progress: number }
  | { id: 'done'; result: JiraSyncResult | GitHubSyncResult }

const STEP_LABELS = ['Connect', 'Select', 'Sync', 'Done'] as const

function getStepIndex(step: WizardStep): number {
  switch (step.id) {
    case 'connect':
    case 'test':
      return 0
    case 'select':
      return 1
    case 'sync':
      return 2
    case 'done':
      return 3
  }
}

// ── Stepper ────────────────────────────────────────────────────────────────

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-start mb-6" data-testid="wizard-stepper">
      {STEP_LABELS.map((label, i) => (
        <div key={label} className={cn('flex flex-col items-center', i < STEP_LABELS.length - 1 && 'flex-1')}>
          <div className="flex items-center w-full">
            <div
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
                i < currentStep
                  ? 'bg-turmeric text-white'
                  : i === currentStep
                    ? 'bg-turmeric/15 text-turmeric border-2 border-turmeric'
                    : 'bg-muted text-muted-foreground'
              )}
              data-testid={`step-${i}`}
            >
              {i < currentStep ? '✓' : i + 1}
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 mx-1',
                  i < currentStep ? 'bg-turmeric' : 'bg-muted'
                )}
              />
            )}
          </div>
          <span
            className={cn(
              'text-[10px] mt-1 whitespace-nowrap',
              i === currentStep ? 'text-turmeric font-medium' : 'text-muted-foreground'
            )}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

export interface IntegrationSetupWizardProps {
  info: IntegrationInfo
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}

/**
 * IntegrationSetupWizard — Client Component
 * 4-step wizard: Connect → Select → Sync → Done
 * Handles both Jira and GitHub integrations.
 */
export function IntegrationSetupWizard({
  info,
  open,
  onOpenChange,
  onComplete,
}: IntegrationSetupWizardProps) {
  const router = useRouter()

  // ── Step state ────────────────────────────────────────────────────────────
  const [step, setStep] = useState<WizardStep>({ id: 'connect' })

  // ── Select step: Jira ────────────────────────────────────────────────────
  const [jiraProjects, setJiraProjects] = useState<JiraProject[]>([])
  const [jiraLoading, setJiraLoading] = useState(false)
  const [selectedJiraKeys, setSelectedJiraKeys] = useState<Set<string>>(new Set())

  // ── Select step: GitHub ─────────────────────────────────────────────────
  const [org, setOrg] = useState('')
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
  const [githubLoading, setGithubLoading] = useState(false)
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set())

  // ── Progress bar interval ref ────────────────────────────────────────────
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep({ id: 'connect' })
        setJiraProjects([])
        setSelectedJiraKeys(new Set())
        setOrg('')
        setGithubRepos([])
        setSelectedRepos(new Set())
      }, 200)
    }
  }, [open])

  // Fetch Jira projects when entering select step
  useEffect(() => {
    if (step.id === 'select' && info.integration === 'jira' && jiraProjects.length === 0) {
      setJiraLoading(true)
      listJiraProjects().then((result) => {
        setJiraLoading(false)
        if (result.error) {
          toast.error(result.error.message)
        } else {
          setJiraProjects(result.data ?? [])
        }
      })
    }
  }, [step.id, info.integration, jiraProjects.length])

  // Fake progress bar ticker for sync step
  useEffect(() => {
    if (step.id === 'sync') {
      progressIntervalRef.current = setInterval(() => {
        setStep((prev) => {
          if (prev.id !== 'sync') return prev
          if (prev.progress >= 90) return prev
          return { id: 'sync', progress: prev.progress + 2 }
        })
      }, 300)
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }, [step.id])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleTestConnection = useCallback(async () => {
    setStep({ id: 'test', testing: true, message: null, verified: false })
    const result = await testConnection({ integration: info.integration })
    if (result.error) {
      setStep({ id: 'test', testing: false, message: result.error.message, verified: false })
    } else {
      setStep({
        id: 'test',
        testing: false,
        message: result.data?.message ?? null,
        verified: result.data?.verified ?? false,
      })
    }
  }, [info.integration])

  const handleLoadGitHubRepos = useCallback(async () => {
    setGithubLoading(true)
    const result = await listGitHubRepos({ org: org.trim() || undefined })
    setGithubLoading(false)
    if (result.error) {
      toast.error(result.error.message)
    } else {
      setGithubRepos(result.data ?? [])
    }
  }, [org])

  const handleSync = useCallback(async () => {
    setStep({ id: 'sync', progress: 10 })

    if (info.integration === 'jira') {
      const result = await syncJiraData({ projectKeys: Array.from(selectedJiraKeys) })

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }

      if (result.error) {
        toast.error(result.error.message)
        setStep({ id: 'select' })
        return
      }

      setStep({ id: 'done', result: result.data ?? { projectsImported: 0, issuesImported: 0, errors: [] } })
    } else {
      const result = await syncGitHubData({ repoFullNames: Array.from(selectedRepos) })

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }

      if (result.error) {
        toast.error(result.error.message)
        setStep({ id: 'select' })
        return
      }

      setStep({ id: 'done', result: result.data ?? { reposImported: 0, pullRequestsImported: 0, workflowRunsImported: 0, errors: [] } })
    }
  }, [info.integration, selectedJiraKeys, selectedRepos])

  const handleDone = useCallback(() => {
    onOpenChange(false)
    onComplete()
    router.refresh()
  }, [onOpenChange, onComplete, router])

  // ── Step content ──────────────────────────────────────────────────────────

  const currentStepIndex = getStepIndex(step)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="wizard-dialog">
        <DialogHeader>
          <DialogTitle>
            {step.id === 'done' ? 'Import complete' : `Set up ${info.name}`}
          </DialogTitle>
          <DialogDescription>
            {step.id === 'connect' || step.id === 'test'
              ? `Verify your ${info.name} connection before selecting data to import.`
              : step.id === 'select'
                ? `Choose which ${info.integration === 'jira' ? 'projects' : 'repositories'} to import data from.`
                : step.id === 'sync'
                  ? 'Importing data — this may take a moment…'
                  : 'Your data has been imported successfully.'}
          </DialogDescription>
        </DialogHeader>

        <Stepper currentStep={currentStepIndex} />

        {/* Step content */}
        {(step.id === 'connect' || step.id === 'test') && (
          <StepConnect step={step} onTest={handleTestConnection} onContinue={() => setStep({ id: 'select' })} />
        )}

        {step.id === 'select' && info.integration === 'jira' && (
          <StepSelectJira
            projects={jiraProjects}
            loading={jiraLoading}
            selected={selectedJiraKeys}
            onToggle={(key) =>
              setSelectedJiraKeys((prev) => {
                const next = new Set(prev)
                if (next.has(key)) next.delete(key)
                else next.add(key)
                return next
              })
            }
            onImport={handleSync}
          />
        )}

        {step.id === 'select' && info.integration === 'github' && (
          <StepSelectGitHub
            org={org}
            onOrgChange={setOrg}
            repos={githubRepos}
            loading={githubLoading}
            selected={selectedRepos}
            onLoad={handleLoadGitHubRepos}
            onToggle={(fullName) =>
              setSelectedRepos((prev) => {
                const next = new Set(prev)
                if (next.has(fullName)) next.delete(fullName)
                else next.add(fullName)
                return next
              })
            }
            onImport={handleSync}
          />
        )}

        {step.id === 'sync' && <StepSync progress={step.progress} />}

        {step.id === 'done' && (
          <StepDone
            result={step.result}
            integration={info.integration}
            onDone={handleDone}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Step sub-components ────────────────────────────────────────────────────

interface StepConnectProps {
  step: Extract<WizardStep, { id: 'connect' | 'test' }>
  onTest: () => void
  onContinue: () => void
}

function StepConnect({ step, onTest, onContinue }: StepConnectProps) {
  const isTesting = step.id === 'test' && step.testing
  const verified = step.id === 'test' && step.verified
  const message = step.id === 'test' ? step.message : null

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        This wizard will help you import your data. First, confirm your credentials
        are working by testing the connection.
      </p>

      {message && (
        <div
          className={cn(
            'px-3 py-2 rounded-md text-sm',
            verified ? 'bg-coriander/10 text-coriander' : 'bg-chili/10 text-chili'
          )}
          role="alert"
          data-testid="connection-message"
        >
          {message}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onTest}
          disabled={isTesting}
          data-testid="test-connection-btn"
          className="flex-1"
        >
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing…
            </>
          ) : (
            'Test Connection'
          )}
        </Button>

        {verified && (
          <Button onClick={onContinue} data-testid="continue-btn" className="flex-1">
            Continue →
          </Button>
        )}
      </div>
    </div>
  )
}

interface StepSelectJiraProps {
  projects: JiraProject[]
  loading: boolean
  selected: Set<string>
  onToggle: (key: string) => void
  onImport: () => void
}

function StepSelectJira({ projects, loading, selected, onToggle, onImport }: StepSelectJiraProps) {
  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No projects found in your Jira workspace.
        </p>
      ) : (
        <ScrollArea className="h-[200px] border rounded-md">
          <div className="p-2 flex flex-col gap-1">
            {projects.map((project) => (
              <label
                key={project.key}
                className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-muted/60 transition-colors"
              >
                <input
                  type="checkbox"
                  className="accent-turmeric h-4 w-4 shrink-0"
                  checked={selected.has(project.key)}
                  onChange={() => onToggle(project.key)}
                  data-testid={`project-checkbox-${project.key}`}
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium">{project.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">{project.key}</span>
                </div>
              </label>
            ))}
          </div>
        </ScrollArea>
      )}

      <Button
        onClick={onImport}
        disabled={selected.size === 0 || loading}
        data-testid="import-btn"
      >
        Import {selected.size > 0 ? `${selected.size} Project${selected.size > 1 ? 's' : ''}` : 'Projects'}
      </Button>
    </div>
  )
}

interface StepSelectGitHubProps {
  org: string
  onOrgChange: (v: string) => void
  repos: GitHubRepo[]
  loading: boolean
  selected: Set<string>
  onLoad: () => void
  onToggle: (fullName: string) => void
  onImport: () => void
}

function StepSelectGitHub({
  org,
  onOrgChange,
  repos,
  loading,
  selected,
  onLoad,
  onToggle,
  onImport,
}: StepSelectGitHubProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Input
          placeholder="Organization name (leave blank for personal repos)"
          value={org}
          onChange={(e) => onOrgChange(e.target.value)}
          className="flex-1"
          data-testid="org-input"
        />
        <Button
          variant="outline"
          onClick={onLoad}
          disabled={loading}
          data-testid="load-repos-btn"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load Repos'}
        </Button>
      </div>

      {repos.length > 0 && (
        <ScrollArea className="h-[200px] border rounded-md">
          <div className="p-2 flex flex-col gap-1">
            {repos.map((repo) => (
              <label
                key={repo.fullName}
                className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-muted/60 transition-colors"
              >
                <input
                  type="checkbox"
                  className="accent-turmeric h-4 w-4 shrink-0"
                  checked={selected.has(repo.fullName)}
                  onChange={() => onToggle(repo.fullName)}
                  data-testid={`repo-checkbox-${repo.fullName}`}
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{repo.name}</span>
                    {repo.isPrivate && (
                      <Badge variant="secondary" className="text-[10px] h-4 px-1 shrink-0">
                        Private
                      </Badge>
                    )}
                    {repo.language && (
                      <Badge variant="outline" className="text-[10px] h-4 px-1 shrink-0">
                        {repo.language}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground truncate">{repo.fullName}</span>
                </div>
              </label>
            ))}
          </div>
        </ScrollArea>
      )}

      <Button
        onClick={onImport}
        disabled={selected.size === 0 || repos.length === 0}
        data-testid="import-btn"
      >
        Import {selected.size > 0 ? `${selected.size} Repo${selected.size > 1 ? 's' : ''}` : 'Repos'}
      </Button>
    </div>
  )
}

function StepSync({ progress }: { progress: number }) {
  return (
    <div className="flex flex-col gap-4 py-2">
      <p className="text-sm text-muted-foreground">
        Fetching and saving your data to the database…
      </p>
      <Progress
        value={progress}
        className="[&>div]:bg-turmeric"
        data-testid="sync-progress"
      />
      <p className="text-xs text-muted-foreground text-right">{progress}%</p>
    </div>
  )
}

interface StepDoneProps {
  result: JiraSyncResult | GitHubSyncResult
  integration: string
  onDone: () => void
}

function StepDone({ result, integration, onDone }: StepDoneProps) {
  const isJira = integration === 'jira'
  const jiraResult = isJira ? (result as JiraSyncResult) : null
  const githubResult = !isJira ? (result as GitHubSyncResult) : null

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-8 w-8 text-coriander shrink-0" />
        <div>
          <p className="font-semibold">Import complete</p>
          <p className="text-sm text-muted-foreground">
            Your {isJira ? 'Jira' : 'GitHub'} data is now in the database.
          </p>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2" data-testid="result-metrics">
        {isJira && jiraResult && (
          <>
            <MetricCell label="Projects imported" value={jiraResult.projectsImported} />
            <MetricCell label="Issues imported" value={jiraResult.issuesImported} />
          </>
        )}
        {!isJira && githubResult && (
          <>
            <MetricCell label="Repos imported" value={githubResult.reposImported} />
            <MetricCell label="Pull requests" value={githubResult.pullRequestsImported} />
            <MetricCell label="Workflow runs" value={githubResult.workflowRunsImported} />
          </>
        )}
      </div>

      {/* Warnings */}
      {result.errors.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-turmeric">Warnings ({result.errors.length})</p>
          <div className="max-h-24 overflow-y-auto flex flex-col gap-1">
            {result.errors.map((err, i) => (
              <p key={i} className="text-xs text-muted-foreground">
                • {err}
              </p>
            ))}
          </div>
        </div>
      )}

      <Button onClick={onDone} data-testid="done-btn">
        Done
      </Button>
    </div>
  )
}

function MetricCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3 flex flex-col gap-1">
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
