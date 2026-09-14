import React, { useState, useEffect } from 'react'
import type { TrainingLevelsData, LevelData } from '../types/curriculum'
import type { Dog, StepProgress, StepStatus } from '../types/db'
import {
  type TrainingDatabase,
  db as defaultDb,
  getOrCreateActiveDog,
  getAllStepProgress,
} from '../db'
import { MarkdownView } from './MarkdownView'
import { CalloutCard } from './CalloutCard'
import './LevelView.css'

export interface LevelViewProps {
  levelNumber: number
  curriculumData: TrainingLevelsData
  db?: TrainingDatabase
  onSelectBehavior: (behaviorKey: string) => void
  onStartDrill: (stepId: string, mode: 'practice' | 'cold') => void
  onOpenNav?: () => void
  onBackToDashboard?: () => void
  onSelectLevel?: (levelNumber: number) => void
}

const STEP_STATUS_MAP: Record<
  StepStatus,
  { label: string; className: string; icon: string }
> = {
  not_started: { label: 'Not Started', className: 'status-not-started', icon: '⚪' },
  in_progress: { label: 'In Progress', className: 'status-in-progress', icon: '🟡' },
  passed_practice: { label: 'Passed Practice', className: 'status-passed-practice', icon: '🟢' },
  passed_cold: { label: 'Passed Cold', className: 'status-passed-cold', icon: '⭐' },
  skipped: { label: 'Skipped', className: 'status-skipped', icon: '⏭️' },
}

export const LevelView: React.FC<LevelViewProps> = ({
  levelNumber,
  curriculumData,
  db = defaultDb,
  onSelectBehavior,
  onStartDrill,
  onOpenNav,
  onBackToDashboard,
  onSelectLevel,
}) => {
  const [activeDog, setActiveDog] = useState<Dog | null>(null)
  const [progressMap, setProgressMap] = useState<Record<string, StepProgress>>({})
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false)

  const levelData: LevelData | undefined = curriculumData.levels.find(
    (l) => l.level === levelNumber
  )

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      const dog = await getOrCreateActiveDog(db)
      if (isMounted) {
        setActiveDog(dog)
        const allProgress = await getAllStepProgress(db, dog.id)
        if (isMounted) {
          setProgressMap(allProgress)
        }
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [db])

  if (!levelData) {
    return (
      <div className="level-view-error">
        <h2>Level {levelNumber} Not Found</h2>
        {onBackToDashboard && (
          <button type="button" onClick={onBackToDashboard}>
            Back to Dashboard
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="level-view-container" data-testid="level-view">
      {/* Level View App Header */}
      <header className="level-header">
        <div className="level-header-top">
          <div className="level-nav-actions">
            {onOpenNav && (
              <button
                type="button"
                className="header-icon-btn"
                onClick={onOpenNav}
                aria-label="Open navigation menu"
                data-testid="nav-toggle-btn"
              >
                ☰
              </button>
            )}
            {onBackToDashboard && (
              <button
                type="button"
                className="header-back-btn"
                onClick={onBackToDashboard}
                aria-label="Back to Dashboard"
              >
                ← Dashboard
              </button>
            )}
          </div>

          <div className="dog-badge-wrapper">
            <span className="dog-badge">{activeDog?.name || 'Primary Dog'}</span>
          </div>
        </div>

        <div className="level-title-row">
          <div className="level-badge-pill">LEVEL {levelNumber}</div>
          <h1 className="level-title" data-testid="level-title">
            Level {levelNumber}: {levelData.title.replace(/^Level \d+:? ?/i, '') || 'Track'}
          </h1>
          {levelData.overview?.pages && (
            <span className="level-pages">Book Pages: {String(levelData.overview.pages)}</span>
          )}
        </div>

        {/* Level Switcher tabs */}
        {onSelectLevel && (
          <div className="level-switcher-tabs" role="tablist" aria-label="Select Level">
            {curriculumData.levels.map((lvl) => (
              <button
                key={lvl.level}
                type="button"
                role="tab"
                aria-selected={lvl.level === levelNumber}
                className={`level-tab-btn ${lvl.level === levelNumber ? 'active' : ''}`}
                onClick={() => onSelectLevel(lvl.level)}
              >
                Level {lvl.level}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="level-content">
        {/* Level Overview Section */}
        {levelData.overview && (
          <section className="level-overview-section" data-testid="level-overview-section">
            <div className="section-title-row">
              <h2 className="section-title">
                <span className="section-icon">ℹ️</span> Level Overview
              </h2>
              <button
                type="button"
                className="overview-toggle-btn"
                onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                aria-expanded={isOverviewExpanded}
              >
                {isOverviewExpanded ? 'Collapse Overview ▴' : 'Read Overview ▾'}
              </button>
            </div>

            <div
              className={`overview-content ${
                isOverviewExpanded ? 'expanded' : 'collapsed'
              }`}
            >
              <MarkdownView content={levelData.overview.contentMarkdown} />

              {levelData.overview.callouts && levelData.overview.callouts.length > 0 && (
                <div className="level-overview-callouts">
                  {levelData.overview.callouts.map((c, i) => (
                    <CalloutCard key={i} callout={c} index={i} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Full Behaviors List */}
        <section className="level-behaviors-section">
          <div className="section-title-row">
            <h2 className="section-title">
              <span className="section-icon">📋</span> Behaviors ({levelData.behaviors.length})
            </h2>
          </div>

          <div className="behaviors-grid">
            {levelData.behaviors.map((behavior) => {
              const behaviorSteps = behavior.steps || []
              const passedColdCount = behaviorSteps.filter(
                (s) => progressMap[s.id]?.status === 'passed_cold'
              ).length
              const passedPracticeCount = behaviorSteps.filter(
                (s) =>
                  progressMap[s.id]?.status === 'passed_practice' ||
                  progressMap[s.id]?.status === 'passed_cold'
              ).length

              return (
                <article
                  key={behavior.id}
                  className="behavior-summary-card"
                  data-testid={`behavior-card-${behavior.id}`}
                >
                  <div className="behavior-card-header">
                    <div className="behavior-title-group">
                      <span className="behavior-order-badge">#{behavior.order}</span>
                      <h3 className="behavior-card-title">{behavior.title}</h3>
                    </div>
                    <span className="behavior-progress-summary">
                      {passedColdCount === 5 ? (
                        <span className="mastery-gold">★ Mastered</span>
                      ) : (
                        `${passedPracticeCount}/5 Steps`
                      )}
                    </span>
                  </div>

                  {behavior.comebefores && (
                    <p className="behavior-comebefores-snippet">
                      <strong>Prerequisites:</strong> {behavior.comebefores.slice(0, 140)}
                      {behavior.comebefores.length > 140 ? '...' : ''}
                    </p>
                  )}

                  {/* 5-step progress indicators */}
                  <div className="behavior-steps-indicators-row">
                    {behaviorSteps.map((step) => {
                      const stepProg = progressMap[step.id]
                      const status: StepStatus = stepProg?.status || 'not_started'
                      const statusCfg = STEP_STATUS_MAP[status]

                      return (
                        <div
                          key={step.id}
                          className={`step-indicator-pill ${statusCfg.className}`}
                          data-testid={`step-indicator-${step.id}`}
                          title={`Step ${step.stepNumber}: ${step.title} (${statusCfg.label})`}
                        >
                          <span className="step-pill-number">S{step.stepNumber}</span>
                          <span className="step-pill-label">{statusCfg.label}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="behavior-card-footer">
                    <button
                      type="button"
                      className="view-behavior-details-btn"
                      onClick={() => onSelectBehavior(behavior.behaviorKey)}
                      data-testid={`view-behavior-btn-${behavior.id}`}
                    >
                      View 5-Step Criteria &amp; Guide →
                    </button>

                    {/* Quick drill launcher for first incomplete step or step 1 */}
                    {behaviorSteps.length > 0 && (
                      <button
                        type="button"
                        className="quick-train-btn"
                        onClick={() => onStartDrill(behaviorSteps[0].id, 'practice')}
                        data-testid={`quick-train-btn-${behaviorSteps[0].id}`}
                        aria-label={`Practice Step 1: ${behavior.title}`}
                      >
                        Train S1 ⚡
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* Homework Section */}
        {levelData.homework && (
          <section className="level-homework-section" data-testid="level-homework-section">
            <div className="section-title-row">
              <h2 className="section-title" data-testid="homework-title">
                <span className="section-icon">📝</span> {levelData.homework.title || 'Homework'}
              </h2>
              {levelData.homework.pages && (
                <span className="homework-pages">Pages: {String(levelData.homework.pages)}</span>
              )}
            </div>

            <div className="homework-body">
              <MarkdownView content={levelData.homework.contentMarkdown} />

              {levelData.homework.callouts && levelData.homework.callouts.length > 0 && (
                <div className="homework-callouts">
                  {levelData.homework.callouts.map((c, i) => (
                    <CalloutCard key={i} callout={c} index={i} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default LevelView
