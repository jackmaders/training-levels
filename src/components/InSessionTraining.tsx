import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  type TrainingDatabase,
  db as defaultDb,
  getOrCreateActiveDog,
  recordDrillSession,
  getStepProgress,
  generateEntityId,
  calculateRepScores,
  findCurriculumStep,
} from '../db'
import type { TrainingLevelsData } from '../types/curriculum'
import type { Dog, StepProgress, RepResult } from '../types/db'
import { ReferenceDrawer } from './ReferenceDrawer'
import { extractStepDurationSeconds } from '../utils/duration'
import { HoldTimer } from './HoldTimer'
import { STEP_STATUS_MAP } from '../utils/statusConfig'
import './InSessionTraining.css'

export interface InSessionTrainingProps {
  db?: TrainingDatabase
  initialStepId?: string
  initialMode?: 'practice' | 'cold'
  curriculumData: TrainingLevelsData
  onBackToDashboard?: () => void
}

export const InSessionTraining: React.FC<InSessionTrainingProps> = ({
  db = defaultDb,
  initialStepId,
  initialMode = 'practice',
  curriculumData,
  onBackToDashboard,
}) => {
  const [activeDog, setActiveDog] = useState<Dog | null>(null)
  const [currentStepId, setCurrentStepId] = useState<string>(
    initialStepId ||
      curriculumData.levels[0]?.behaviors[0]?.steps[0]?.id ||
      'level-1-zen-step-1'
  )
  const [reps, setReps] = useState<RepResult[]>([])
  const repsRef = useRef<RepResult[]>([])
  const [stepProgress, setStepProgress] = useState<StepProgress | null>(null)
  const [mode, setMode] = useState<'practice' | 'cold'>(initialMode)
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
  const [drillLogId, setDrillLogId] = useState<string>(() =>
    generateEntityId('log')
  )

  const maxReps = mode === 'cold' ? 1 : 5

  const stepMeta = findCurriculumStep(curriculumData, currentStepId)
  const behavior = stepMeta?.behavior
  const step = stepMeta?.step
  const levelNumber = stepMeta?.levelNumber
  const targetDurationSeconds = extractStepDurationSeconds(step)

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

  const resetDrillState = useCallback(() => {
    repsRef.current = []
    setReps([])
    setDrillLogId(generateEntityId('log'))
  }, [])

  // Sync initialStepId prop changes
  useEffect(() => {
    if (initialStepId && initialStepId !== currentStepId) {
      setCurrentStepId(initialStepId)
      resetDrillState()
    }
  }, [initialStepId, resetDrillState])

  // Reset drill reps when changing step
  const handleSelectStep = (stepId: string) => {
    setCurrentStepId(stepId)
    resetDrillState()
    if (activeDog) {
      getStepProgress(db, activeDog.id, stepId).then((progress) => {
        setStepProgress(progress || null)
      })
    }
  }

  // Handle mode toggle
  const handleToggleMode = (nextMode: 'practice' | 'cold') => {
    if (nextMode !== mode) {
      setMode(nextMode)
      resetDrillState()
    }
  }

  // Record Rep Tap
  const handleLogRep = async (result: RepResult) => {
    if (!behavior || !step || repsRef.current.length >= maxReps) return

    const nextReps = [...repsRef.current, result]
    repsRef.current = nextReps
    setReps(nextReps)

    const dog = activeDog || (await getOrCreateActiveDog(db))
    if (!activeDog) {
      setActiveDog(dog)
    }

    const res = await recordDrillSession(db, {
      logId: drillLogId,
      dogId: dog.id,
      stepId: step.id,
      levelId: levelNumber || 1,
      behaviorKey: behavior.behaviorKey,
      stepNumber: step.stepNumber,
      reps: nextReps,
      mode,
    })

    setStepProgress(res.progress)
  }

  const { passedCount, missedCount: _missedCount, isCompleted: isDrillComplete } =
    calculateRepScores(reps, mode)

  const currentStatusConfig =
    STEP_STATUS_MAP[stepProgress?.status || 'not_started']

  // Split-criteria check: 3 consecutive misses in active session
  const hasThreeConsecutiveMisses = reps.some(
    (r, i) => r === 'miss' && reps[i + 1] === 'miss' && reps[i + 2] === 'miss'
  )

  // Real-time pace indicator calculation
  const passingPercentage =
    reps.length > 0 ? Math.round((passedCount / reps.length) * 100) : null

  const paceIndicatorText =
    reps.length > 0
      ? `${passingPercentage}% Passing Pace (${passedCount}/${reps.length} reps)`
      : 'Ready (0/5 reps)'

  return (
    <div className="in-session-container">
      {/* Pinned Top Criterion Header */}
      <header
        className="pinned-criterion-header"
        data-testid="criterion-header"
      >
        <div className="header-top-row">
          {onBackToDashboard && (
            <button
              type="button"
              className="back-btn"
              onClick={onBackToDashboard}
              aria-label="Back to Dashboard"
              style={{
                background: 'none',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
                marginRight: '0.5rem',
              }}
            >
              ← Dashboard
            </button>
          )}
          <div className="behavior-step-label">
            <span className="behavior-title" data-testid="behavior-title">
              {behavior?.title || 'Training Behavior'}
            </span>
            <span className="step-number" data-testid="step-number">
              Step {step?.stepNumber || 1}
            </span>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="full-guide-btn"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Full Guide"
              aria-expanded={isDrawerOpen}
              data-testid="full-guide-trigger"
            >
              <span className="guide-icon" aria-hidden="true">📖</span>
              <span className="guide-label">Full Guide</span>
            </button>

            <div
              className={`status-badge ${currentStatusConfig.className}`}
              data-testid="step-status-badge"
            >
              {currentStatusConfig.label}
            </div>
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
            Step:
          </label>
          <select
            id="step-select"
            value={currentStepId}
            onChange={(e) => handleSelectStep(e.target.value)}
            className="step-select"
          >
            {curriculumData.levels.map((lvl) => (
              <optgroup
                key={lvl.level}
                label={`Level ${lvl.level}: ${lvl.title}`}
              >
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

      {/* Middle Viewport */}
      <main className="training-viewport">
        {/* Mode Switcher */}
        <div className="mode-toggle-container">
          <button
            type="button"
            className={`mode-btn ${mode === 'practice' ? 'active' : ''}`}
            onClick={() => handleToggleMode('practice')}
          >
            Practice Mode
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'cold' ? 'active' : ''}`}
            onClick={() => handleToggleMode('cold')}
          >
            Cold Test
          </button>
        </div>

        {/* Split-Criteria Warning Alert */}
        {hasThreeConsecutiveMisses && (
          <div
            className="split-criteria-alert"
            data-testid="split-criteria-alert"
            role="alert"
          >
            <div className="split-alert-icon">⚠️</div>
            <div className="split-alert-content">
              <strong className="split-alert-title">
                Split Criteria Warning
              </strong>
              <p className="split-alert-message">
                3 consecutive misses logged. Consider lowering criteria, reducing
                duration or distance, or sliding down the chute (Chutes &amp;
                Ladders) to rebuild success!
              </p>
            </div>
          </div>
        )}

        {/* Instructions Summary Card */}
        <div className="instructions-card">
          <h3 className="instructions-title">{step?.title}</h3>
          <p className="instructions-summary">
            {step?.instructionsMarkdown
              ? step.instructionsMarkdown.substring(0, 240) + '...'
              : 'Follow the pass criterion for each repetition.'}
          </p>
        </div>

        {/* Drill Completion Feedback */}
        {isDrillComplete && (
          <div
            className={`drill-summary-banner ${
              mode === 'cold'
                ? passedCount >= 1
                  ? 'summary-passed'
                  : 'summary-failed'
                : passedCount >= 4
                  ? 'summary-passed'
                  : 'summary-failed'
            }`}
          >
            {mode === 'cold' ? (
              passedCount >= 1 ? (
                <p>
                  🎉 <strong>Cold Test Passed!</strong> (1/1 rep passed) — Certified Cold Retention!
                </p>
              ) : (
                <p>
                  ⚠️ <strong>Cold Test Missed</strong> (0/1 rep). Practice 5-rep sets before trying cold again!
                </p>
              )
            ) : passedCount >= 4 ? (
              <p>
                🎉 <strong>Drill Passed!</strong> ({passedCount}/5 reps passed) — Saved to progress!
              </p>
            ) : (
              <p>
                ⚠️ <strong>Drill Incomplete</strong> ({passedCount}/5 passes). Keep practicing or split criteria!
              </p>
            )}
            <button
              type="button"
              className="new-drill-btn"
              onClick={resetDrillState}
            >
              {mode === 'cold' ? 'Start New Cold Test' : 'Start New 5-Rep Drill'}
            </button>
          </div>
        )}
      </main>

      {/* Docked Bottom Hub: Hold Timer (if duration step), Matrix & Fixed One-Thumb Action Buttons */}
      <footer className="fixed-bottom-hub">
        {/* Integrated Hold Timer directly above the 5-rep matrix */}
        {targetDurationSeconds !== null && (
          <HoldTimer targetSeconds={targetDurationSeconds} />
        )}

        <div className="docked-matrix-wrapper">
          <div className="docked-matrix-header">
            <span className="matrix-title">
              {mode === 'cold' ? 'Cold Retention Test (1 Rep)' : '5-Rep Matrix'}
            </span>
            <span className="matrix-pace" data-testid="pace-indicator">
              {mode === 'cold'
                ? reps.length > 0
                  ? passedCount === 1
                    ? '✓ Passed Cold'
                    : '✕ Missed Cold'
                  : '1 Cold Rep (0 warmups)'
                : paceIndicatorText}
            </span>
          </div>

          <div className="rep-matrix" data-testid="rep-matrix">
            {(mode === 'cold' ? [0] : [0, 1, 2, 3, 4]).map((idx) => {
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
        </div>

        <div className="action-buttons-row">
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
        </div>
      </footer>

      {/* Slide-Up Quick Reference Drawer */}
      <ReferenceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        behavior={behavior}
        step={step}
        levelNumber={levelNumber}
      />
    </div>
  )
}
export default InSessionTraining
