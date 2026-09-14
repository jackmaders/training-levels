import React, { useState, useEffect, useCallback } from 'react'
import {
  type TrainingDatabase,
  db as defaultDb,
  getOrCreateActiveDog,
  getSessionLogs,
  getRecommendedNextDrill,
  findCurriculumStep,
  type RecommendedDrill,
} from '../db'
import type { TrainingLevelsData } from '../types/curriculum'
import type { Dog, SessionLog } from '../types/db'
import { SettingsModal } from './SettingsModal'
import './HomeDashboard.css'

export interface HomeDashboardProps {
  db?: TrainingDatabase
  curriculumData: TrainingLevelsData
  onStartDrill: (stepId: string, mode: 'practice' | 'cold') => void
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  db = defaultDb,
  curriculumData,
  onStartDrill,
}) => {
  const [activeDog, setActiveDog] = useState<Dog | null>(null)
  const [recommendedDrill, setRecommendedDrill] = useState<RecommendedDrill | null>(null)
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([])
  const [selectedMode, setSelectedMode] = useState<'practice' | 'cold'>('practice')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadDashboardData = useCallback(async () => {
    try {
      const dog = await getOrCreateActiveDog(db)
      setActiveDog(dog)

      const recommendation = await getRecommendedNextDrill(db, dog.id, curriculumData)
      setRecommendedDrill(recommendation)
      if (recommendation) {
        setSelectedMode(recommendation.suggestedMode)
      }

      const logs = await getSessionLogs(db, dog.id)
      setSessionLogs(logs)
    } finally {
      setLoading(false)
    }
  }, [db, curriculumData])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const formatLogDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  if (loading && !activeDog) {
    return <div className="dashboard-loading">Loading Dashboard...</div>
  }

  return (
    <div className="home-dashboard-container" data-testid="home-dashboard">
      {/* Dog Header */}
      <header className="dashboard-header">
        <div className="header-brand">
          <span className="brand-title">Training Levels PWA</span>
          <div className="header-actions">
            <span className="dog-badge">{activeDog?.name || 'Primary Dog'}</span>
            <button
              type="button"
              className="dashboard-settings-btn"
              data-testid="settings-btn"
              aria-label="Settings"
              onClick={() => setIsSettingsOpen(true)}
            >
              ⚙️
            </button>
          </div>
        </div>
        <h1 className="dashboard-title">Dashboard</h1>
      </header>

      <main className="dashboard-content">
        {/* Recommended Next Drill Hero Card */}
        {recommendedDrill && (
          <section
            className="recommended-hero-card"
            data-testid="recommended-hero-card"
          >
            <div className="hero-top-row">
              <span className="hero-tag">RECOMMENDED NEXT DRILL</span>
              <span className="hero-level-badge">
                Level {recommendedDrill.levelNumber}
              </span>
            </div>

            <div className="hero-title-group">
              <h2 className="hero-behavior-title" data-testid="hero-behavior-title">
                {recommendedDrill.behaviorTitle}
              </h2>
              <span className="hero-step-number" data-testid="hero-step-number">
                Step {recommendedDrill.step.stepNumber}: {recommendedDrill.step.title}
              </span>
            </div>

            <div className="hero-criterion-box">
              <span className="criterion-heading">PASS CRITERION</span>
              <p className="hero-criterion-text" data-testid="hero-criterion-text">
                {recommendedDrill.step.criterionSummary}
              </p>
            </div>

            {recommendedDrill.reason && (
              <div className="hero-reason-box">
                <span className="reason-icon">💡</span>
                <span className="reason-text">{recommendedDrill.reason}</span>
              </div>
            )}

            {/* Mode Switcher */}
            <div className="hero-mode-selector">
              <span className="mode-selector-label">SELECT MODE:</span>
              <div className="mode-toggle-group">
                <button
                  type="button"
                  className={`mode-toggle-btn ${
                    selectedMode === 'practice' ? 'active' : ''
                  }`}
                  onClick={() => setSelectedMode('practice')}
                >
                  Practice Mode (5 Reps)
                </button>
                <button
                  type="button"
                  className={`mode-toggle-btn ${
                    selectedMode === 'cold' ? 'active' : ''
                  }`}
                  onClick={() => setSelectedMode('cold')}
                >
                  Cold Test (1 Rep)
                </button>
              </div>
            </div>

            {/* Hero CTA Button */}
            <button
              type="button"
              className="hero-start-cta"
              onClick={() => onStartDrill(recommendedDrill.step.id, selectedMode)}
            >
              {selectedMode === 'cold'
                ? 'Start Cold Test →'
                : 'Start Practice Drill →'}
            </button>
          </section>
        )}

        {/* Recent Session History Feed */}
        <section
          className="session-history-section"
          data-testid="session-history-feed"
        >
          <div className="section-header-row">
            <h2 className="section-heading">Recent Session History</h2>
            <span className="history-count-badge">
              {sessionLogs.length} {sessionLogs.length === 1 ? 'drill' : 'drills'}
            </span>
          </div>

          {sessionLogs.length === 0 ? (
            <div className="empty-history-card">
              <p className="empty-title">No training sessions recorded yet.</p>
              <p className="empty-subtitle">
                Start your first drill above to build your dog's mastery record!
              </p>
            </div>
          ) : (
            <div className="history-logs-list">
              {sessionLogs.map((log) => {
                const stepMeta = findCurriculumStep(curriculumData, log.stepId)
                const isCold = log.mode === 'cold'

                let complianceBadgeClass = 'badge-pass'
                let complianceBadgeText = ''

                if (isCold) {
                  if (log.passed) {
                    complianceBadgeClass = 'badge-passed-cold'
                    complianceBadgeText = '✓ Passed Cold'
                  } else {
                    complianceBadgeClass = 'badge-missed-cold'
                    complianceBadgeText = '✕ Failed Cold'
                  }
                } else {
                  if (log.passed) {
                    complianceBadgeClass = 'badge-passed-practice'
                    complianceBadgeText = `✓ ${log.passedCount}/${log.reps.length} Passed`
                  } else {
                    complianceBadgeClass = 'badge-missed-practice'
                    complianceBadgeText = `✕ ${log.passedCount}/${log.reps.length} Incomplete`
                  }
                }

                return (
                  <article
                    key={log.id}
                    className="session-log-card"
                    data-testid={`session-log-card-${log.id}`}
                  >
                    <div className="log-card-header">
                      <div className="log-step-identity">
                        <span className="log-level-tag">
                          L{log.levelId}
                        </span>
                        <h3 className="log-step-title">
                          {stepMeta
                            ? `${stepMeta.behaviorTitle} — Step ${stepMeta.step.stepNumber}: ${stepMeta.step.title}`
                            : `${log.behaviorKey} — Step ${log.stepNumber}`}
                        </h3>
                      </div>
                      <span className={`compliance-badge ${complianceBadgeClass}`}>
                        {complianceBadgeText}
                      </span>
                    </div>

                    <div className="log-card-footer">
                      <span className="log-date">
                        {formatLogDate(log.startedAt || log.completedAt)}
                      </span>
                      <span className="log-mode-label">
                        {isCold ? 'Cold Test (1 rep)' : 'Practice (5 reps)'}
                      </span>
                      <button
                        type="button"
                        className="log-train-again-btn"
                        onClick={() => onStartDrill(log.stepId, log.mode)}
                      >
                        Train Again →
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        db={db}
        activeDog={activeDog}
        onDataMutated={loadDashboardData}
      />
    </div>
  )
}

export default HomeDashboard
