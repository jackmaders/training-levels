import React, { useState, useEffect, useCallback } from 'react'
import {
  type TrainingDatabase,
  db as defaultDb,
  getOrCreateActiveDog,
  recordDrillSession,
  getStepProgress,
} from '../db'
import type { TrainingLevelsData, BehaviorData, StepData } from '../types/curriculum'
import type { Dog, StepProgress, RepResult, StepStatus } from '../types/db'
import './InSessionTraining.css'

export interface InSessionTrainingProps {
  db?: TrainingDatabase
  initialStepId?: string
  curriculumData: TrainingLevelsData
}

export const InSessionTraining: React.FC<InSessionTrainingProps> = ({
  db = defaultDb,
  initialStepId,
  curriculumData,
}) => {
  const [activeDog, setActiveDog] = useState<Dog | null>(null)
  const [currentStepId, setCurrentStepId] = useState<string>(
    initialStepId ||
      curriculumData.levels[0]?.behaviors[0]?.steps[0]?.id ||
      'level-1-zen-step-1'
  )
  const [reps, setReps] = useState<RepResult[]>([])
  const [stepProgress, setStepProgress] = useState<StepProgress | null>(null)
  const [mode, setMode] = useState<'practice' | 'cold'>('practice')

  // Find step and behavior in curriculumData
  const findStepAndBehavior = useCallback(
    (stepId: string): { behavior?: BehaviorData; step?: StepData; levelNumber?: number } => {
      for (const level of curriculumData.levels) {
        for (const behavior of level.behaviors) {
          const step = behavior.steps.find((s) => s.id === stepId)
          if (step) {
            return { behavior, step, levelNumber: level.level }
          }
        }
      }
      return {}
    },
    [curriculumData]
  )

  const { behavior, step, levelNumber } = findStepAndBehavior(currentStepId)

  // Initialize dog & load progress
  useEffect(() => {
    let isMounted = true
    async function init() {
      const dog = await getOrCreateActiveDog(db)
      if (isMounted) {
        setActiveDog(dog)
        const progress = await getStepProgress(db, dog.id, currentStepId)
        if (isMounted && progress) {
          setStepProgress(progress)
        }
      }
    }
    init()
    return () => {
      isMounted = false
    }
  }, [db, currentStepId])

  const [drillLogId, setDrillLogId] = useState<string>(
    () => `log-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  )

  // Reset drill reps when changing step
  const handleSelectStep = (stepId: string) => {
    setCurrentStepId(stepId)
    setReps([])
    setDrillLogId(`log-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`)
    if (activeDog) {
      getStepProgress(db, activeDog.id, stepId).then((progress) => {
        setStepProgress(progress || null)
      })
    }
  }

  // Record Rep Tap
  const handleLogRep = async (result: RepResult) => {
    if (!behavior || !step) return

    const dog = activeDog || (await getOrCreateActiveDog(db))
    if (!activeDog) {
      setActiveDog(dog)
    }

    setReps((prevReps) => {
      if (prevReps.length >= 5) return prevReps
      const newReps = [...prevReps, result]

      // Atomically persist drill to Dexie
      recordDrillSession(db, {
        logId: drillLogId,
        dogId: dog.id,
        stepId: step.id,
        levelId: levelNumber || 1,
        behaviorKey: behavior.behaviorKey,
        stepNumber: step.stepNumber,
        reps: newReps,
        mode,
      }).then((res) => {
        setStepProgress(res.progress)
      })

      return newReps
    })
  }

  const handleResetDrill = () => {
    setReps([])
    setDrillLogId(`log-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`)
  }

  const passedCount = reps.filter((r) => r === 'pass').length
  const missedCount = reps.filter((r) => r === 'miss').length
  const isDrillComplete = reps.length === 5

  const formatStatus = (status?: StepStatus) => {
    switch (status) {
      case 'passed_cold':
        return 'Passed Cold'
      case 'passed_practice':
        return 'Passed Practice'
      case 'in_progress':
        return 'In Progress'
      case 'skipped':
        return 'Skipped'
      default:
        return 'Not Started'
    }
  }

  const getStatusClass = (status?: StepStatus) => {
    switch (status) {
      case 'passed_cold':
        return 'status-passed-cold'
      case 'passed_practice':
        return 'status-passed-practice'
      case 'in_progress':
        return 'status-in-progress'
      default:
        return 'status-not-started'
    }
  }

  return (
    <div className="in-session-container">
      {/* Pinned Top Criterion Header */}
      <header className="pinned-criterion-header" data-testid="criterion-header">
        <div className="header-top-row">
          <div className="behavior-step-label">
            <span className="behavior-title" data-testid="behavior-title">
              {behavior?.title || 'Training Behavior'}
            </span>
            <span className="step-number" data-testid="step-number">
              Step {step?.stepNumber || 1}
            </span>
          </div>

          <div
            className={`status-badge ${getStatusClass(stepProgress?.status)}`}
            data-testid="step-status-badge"
          >
            {formatStatus(stepProgress?.status)}
          </div>
        </div>

        <div className="criterion-card">
          <span className="criterion-label">PASS CRITERION</span>
          <p className="criterion-text" data-testid="criterion-text">
            {step?.criterionSummary || 'Loading criterion...'}
          </p>
        </div>

        {/* Quick step picker dropdown */}
        <div className="step-selector-row">
          <label htmlFor="step-select" className="step-selector-label">
            Change Step:
          </label>
          <select
            id="step-select"
            value={currentStepId}
            onChange={(e) => handleSelectStep(e.target.value)}
            className="step-select"
          >
            {curriculumData.levels.map((lvl) => (
              <optgroup key={lvl.level} label={`Level ${lvl.level}: ${lvl.title}`}>
                {lvl.behaviors.map((beh) =>
                  beh.steps.map((st) => (
                    <option key={st.id} value={st.id}>
                      {beh.title} — Step {st.stepNumber}: {st.title}
                    </option>
                  ))
                )}
              </optgroup>
            ))}
          </select>
        </div>
      </header>

      {/* Mode Switcher */}
      <div className="mode-toggle-container">
        <button
          type="button"
          className={`mode-btn ${mode === 'practice' ? 'active' : ''}`}
          onClick={() => setMode('practice')}
        >
          Practice Mode
        </button>
        <button
          type="button"
          className={`mode-btn ${mode === 'cold' ? 'active' : ''}`}
          onClick={() => setMode('cold')}
        >
          Cold Test
        </button>
      </div>

      {/* Middle Viewport: 5-Rep Matrix & Feedback */}
      <main className="training-viewport">
        <div className="matrix-card">
          <div className="matrix-header">
            <h2 className="matrix-title">5-Rep Matrix</h2>
            <span className="matrix-pace">
              {reps.length > 0
                ? `${passedCount} Pass / ${missedCount} Miss (${reps.length}/5 reps)`
                : 'Ready to start'}
            </span>
          </div>

          <div className="rep-matrix" data-testid="rep-matrix">
            {[0, 1, 2, 3, 4].map((idx) => {
              const repResult = reps[idx]
              let dotClass = 'rep-dot empty'
              let dotContent = `${idx + 1}`

              if (repResult === 'pass') {
                dotClass = 'rep-dot pass'
                dotContent = '✓'
              } else if (repResult === 'miss') {
                dotClass = 'rep-dot miss'
                dotContent = '✕'
              }

              return (
                <div
                  key={idx}
                  className={dotClass}
                  data-testid={`rep-dot-${idx}`}
                  aria-label={`Rep ${idx + 1}: ${repResult || 'pending'}`}
                >
                  {dotContent}
                </div>
              )
            })}
          </div>

          {/* Drill completion summary feedback */}
          {isDrillComplete && (
            <div
              className={`drill-summary-banner ${
                passedCount >= 4 ? 'summary-passed' : 'summary-failed'
              }`}
            >
              {passedCount >= 4 ? (
                <p>
                  🎉 <strong>Drill Passed!</strong> ({passedCount}/5 reps passed) — Saved
                  to progress!
                </p>
              ) : (
                <p>
                  ⚠️ <strong>Drill Incomplete</strong> ({passedCount}/5 passes). Keep
                  practicing or consider splitting criteria!
                </p>
              )}
              <button
                type="button"
                className="new-drill-btn"
                onClick={handleResetDrill}
              >
                Start New 5-Rep Drill
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Bottom Action Bar */}
      <footer className="fixed-bottom-actions">
        <button
          type="button"
          className="action-btn miss-btn"
          disabled={isDrillComplete}
          onClick={() => handleLogRep('miss')}
          aria-label="Miss"
        >
          <span className="btn-icon">✕</span>
          <span className="btn-label">Miss</span>
        </button>

        <button
          type="button"
          className="action-btn pass-btn"
          disabled={isDrillComplete}
          onClick={() => handleLogRep('pass')}
          aria-label="Pass"
        >
          <span className="btn-icon">✓</span>
          <span className="btn-label">Pass</span>
        </button>
      </footer>
    </div>
  )
}
export default InSessionTraining
