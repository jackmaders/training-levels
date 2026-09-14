import type { StepStatus } from '../types/db'

export interface StepStatusConfig {
  label: string
  className: string
  icon: string
}

export const STEP_STATUS_MAP: Record<StepStatus, StepStatusConfig> = {
  not_started: {
    label: 'Not Started',
    className: 'status-not-started',
    icon: '⚪',
  },
  in_progress: {
    label: 'In Progress',
    className: 'status-in-progress',
    icon: '🟡',
  },
  passed_practice: {
    label: 'Passed Practice',
    className: 'status-passed-practice',
    icon: '🟢',
  },
  passed_cold: {
    label: 'Passed Cold',
    className: 'status-passed-cold',
    icon: '⭐',
  },
  skipped: {
    label: 'Skipped',
    className: 'status-skipped',
    icon: '⏭️',
  },
}
