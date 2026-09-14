import React, { useState, useEffect } from 'react'
import type { TrainingLevelsData, BehaviorData, StepData } from '../types/curriculum'
import type { Dog, StepProgress, StepStatus } from '../types/db'
import {
  type TrainingDatabase,
  db as defaultDb,
  getOrCreateActiveDog,
  getAllStepProgress,
} from '../db'
import { MarkdownView } from './MarkdownView'
import { CalloutCard } from './CalloutCard'
import { STEP_STATUS_MAP } from '../utils/statusConfig'
import './BehaviorDetailView.css'

export interface BehaviorDetailViewProps {
  levelNumber: number
  behaviorKey: string
  curriculumData: TrainingLevelsData
  db?: TrainingDatabase
  onBackToLevel: () => void
  onStartDrill: (stepId: string, mode: 'practice' | 'cold') => void
  onOpenNav?: () => void
  onBackToDashboard?: () => void
}

export const BehaviorDetailView: React.FC<BehaviorDetailViewProps> = ({
  levelNumber,
  behaviorKey,
  curriculumData,
  db = defaultDb,
  onBackToLevel,
  onStartDrill,
  onOpenNav,
  onBackToDashboard,
}) => {
  const [activeDog, setActiveDog] = useState<Dog | null>(null)
  const [progressMap, setProgressMap] = useState<Record<string, StepProgress>>({})

  const levelData = curriculumData.levels.find((l) => l.level === levelNumber)
  const behavior: BehaviorData | undefined = levelData?.behaviors.find(
    (b) => b.behaviorKey === behaviorKey || b.id === `level-${levelNumber}-${behaviorKey}`
  )

  useEffect(() => {
    let isMounted = true
    async function loadProgress() {
      const dog = await getOrCreateActiveDog(db)
      if (isMounted) {
        setActiveDog(dog)
        const allProgress = await getAllStepProgress(db, dog.id)
        if (isMounted) {
          setProgressMap(allProgress)
        }
      }
    }
    loadProgress()
    return () => {
      isMounted = false
    }
  }, [db])

  if (!behavior) {
    return (
      <div className="behavior-detail-error">
        <h2>Behavior not found</h2>
        <button type="button" onClick={onBackToLevel}>
          Back to Level {levelNumber}
        </button>
      </div>
    )
  }

  return (
    <div className="behavior-detail-container" data-testid="behavior-detail-view">
      {/* App & Navigation Header */}
      <header className="behavior-detail-header">
        <div className="behavior-header-top">
          <div className="behavior-nav-actions">
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
            <button
              type="button"
              className="header-back-btn"
              onClick={onBackToLevel}
              aria-label={`Back to Level ${levelNumber}`}
              data-testid="back-to-level-btn"
            >
              ← Level {levelNumber}
            </button>
            {onBackToDashboard && (
              <button
                type="button"
                className="header-dash-btn"
                onClick={onBackToDashboard}
                aria-label="Dashboard"
              >
                Dashboard
              </button>
            )}
          </div>

          <span className="dog-badge">{activeDog?.name || 'Primary Dog'}</span>
        </div>

        <div className="behavior-header-main">
          <div className="behavior-meta-row">
            <span className="level-badge">Level {levelNumber}</span>
            <span className="behavior-order-pill">Order #{behavior.order}</span>
            {behavior.pages && (
              <span className="book-pages-tag">Book pp. {String(behavior.pages)}</span>
            )}
          </div>
          <h1 className="behavior-title" data-testid="behavior-detail-title">
            {behavior.title}
          </h1>
        </div>
      </header>

      <main className="behavior-detail-content">
        {/* Prerequisites / Comebefores */}
        {behavior.comebefores && (
          <section
            className="detail-card prerequisite-card"
            data-testid="behavior-comebefores-section"
          >
            <h2 className="detail-card-heading">
              <span className="card-icon">🧱</span> Prerequisites (Comebefores)
            </h2>
            <div className="detail-card-body">
              <MarkdownView content={behavior.comebefores} />
            </div>
          </section>
        )}

        {/* Equipment & Setting Factors */}
        {behavior.equipment && (
          <section
            className="detail-card equipment-card"
            data-testid="behavior-equipment-section"
          >
            <h2 className="detail-card-heading">
              <span className="card-icon">🎒</span> Equipment &amp; Setting Factors
            </h2>
            <div className="detail-card-body">
              <MarkdownView content={behavior.equipment} />
            </div>
          </section>
        )}

        {/* Think About Notes / About Cues */}
        {(behavior.thinkAbout || behavior.aboutCues) && (
          <section
            className="detail-card think-about-card"
            data-testid="behavior-think-about-section"
          >
            <h2 className="detail-card-heading">
              <span className="card-icon">🧠</span> Think About It &amp; Cues
            </h2>
            <div className="detail-card-body">
              {behavior.thinkAbout && <MarkdownView content={behavior.thinkAbout} />}
              {behavior.aboutCues && (
                <div className="about-cues-block">
                  <h3 className="cues-subheading">About Cues</h3>
                  <MarkdownView content={behavior.aboutCues} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* 5-Step Criteria Summary Table */}
        <section
          className="detail-card criteria-table-card"
          data-testid="behavior-criteria-table-section"
        >
          <h2 className="detail-card-heading">
            <span className="card-icon">📊</span> 5-Step Criteria Matrix
          </h2>
          <div className="criteria-table-container">
            <table className="behavior-criteria-table">
              <thead>
                <tr>
                  <th scope="col" className="col-step">Step</th>
                  <th scope="col" className="col-criteria">Criteria</th>
                  <th scope="col" className="col-status">Status</th>
                </tr>
              </thead>
              <tbody>
                {behavior.steps.map((step) => {
                  const stepProg = progressMap[step.id]
                  const status: StepStatus = stepProg?.status || 'not_started'
                  const statusCfg = STEP_STATUS_MAP[status]

                  return (
                    <tr key={step.stepNumber} className="criteria-row">
                      <td className="step-num-cell">Step {step.stepNumber}</td>
                      <td className="criterion-cell">
                        <strong>{step.title}:</strong> {step.criterionSummary}
                      </td>
                      <td className="status-cell">
                        <span
                          className={`status-pill ${statusCfg.className}`}
                          data-testid={`criteria-status-step-${step.stepNumber}`}
                        >
                          {statusCfg.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Behavior Overview Callouts */}
        {behavior.callouts && behavior.callouts.length > 0 && (
          <section className="behavior-callouts-stack">
            {behavior.callouts.map((c, i) => (
              <CalloutCard key={i} callout={c} index={i} />
            ))}
          </section>
        )}

        {/* 5 Detailed Step Cards with Step Launchers */}
        <section className="behavior-steps-section">
          <h2 className="steps-section-heading">
            <span className="card-icon">🚀</span> 5-Step Curriculum &amp; Practice Launchers
          </h2>

          <div className="steps-list">
            {behavior.steps.map((step: StepData) => {
              const stepProg = progressMap[step.id]
              const status: StepStatus = stepProg?.status || 'not_started'
              const statusCfg = STEP_STATUS_MAP[status]

              return (
                <article
                  key={step.id}
                  className="step-detail-card"
                  data-testid={`step-card-${step.id}`}
                >
                  <div className="step-card-header">
                    <div className="step-header-left">
                      <span className="step-badge">Step {step.stepNumber}</span>
                      <h3 className="step-title">{step.title}</h3>
                    </div>
                    <span
                      className={`status-pill ${statusCfg.className}`}
                      data-testid={`step-progress-badge-${step.id}`}
                    >
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Criterion Box */}
                  <div className="step-criterion-box">
                    <span className="criterion-label">PASS CRITERION:</span>
                    <p className="step-criterion-text">{step.criterionSummary}</p>
                  </div>

                  {/* Step Instructions */}
                  {step.instructionsMarkdown && (
                    <div className="step-instructions">
                      <span className="step-section-label">INSTRUCTIONS:</span>
                      <MarkdownView content={step.instructionsMarkdown} />
                    </div>
                  )}

                  {/* Try it Cold / Comeafters */}
                  {(step.tryItCold || step.comeafters) && (
                    <div className="step-meta-blocks">
                      {step.tryItCold && (
                        <div className="step-cold-block">
                          <strong>❄️ Try It Cold:</strong>
                          <MarkdownView content={step.tryItCold} />
                        </div>
                      )}
                      {step.comeafters && (
                        <div className="step-comeafters-block">
                          <strong>🎯 Comeafters:</strong>
                          <MarkdownView content={step.comeafters} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step Callouts */}
                  {step.callouts && step.callouts.length > 0 && (
                    <div className="step-callouts-list">
                      {step.callouts.map((c, idx) => (
                        <CalloutCard key={idx} callout={c} index={idx} />
                      ))}
                    </div>
                  )}

                  {/* Direct Step Launchers Footer */}
                  <div className="step-launchers-footer">
                    <button
                      type="button"
                      className="step-launch-btn btn-practice"
                      onClick={() => onStartDrill(step.id, 'practice')}
                      data-testid={`start-practice-btn-${step.id}`}
                      aria-label={`Start Practice for Step ${step.stepNumber}: ${step.title}`}
                    >
                      ▶ Practice (5 Reps)
                    </button>
                    <button
                      type="button"
                      className="step-launch-btn btn-cold"
                      onClick={() => onStartDrill(step.id, 'cold')}
                      data-testid={`start-cold-btn-${step.id}`}
                      aria-label={`Start Cold Test for Step ${step.stepNumber}: ${step.title}`}
                    >
                      ❄️ Cold Test (1 Rep)
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}

export default BehaviorDetailView
