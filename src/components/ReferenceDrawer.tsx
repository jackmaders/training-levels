import React, { useEffect } from 'react'
import type { BehaviorData, StepData } from '../types/curriculum'
import { CalloutCard } from './CalloutCard'
import { MarkdownView } from './MarkdownView'

export interface ReferenceDrawerProps {
  isOpen: boolean
  onClose: () => void
  behavior?: BehaviorData
  step?: StepData
  levelNumber?: number
}

export const ReferenceDrawer: React.FC<ReferenceDrawerProps> = ({
  isOpen,
  onClose,
  behavior,
  step,
  levelNumber,
}) => {
  const closeBtnRef = React.useRef<HTMLButtonElement>(null)

  // Handle ESC key press to close drawer and focus close button
  useEffect(() => {
    if (!isOpen) return

    closeBtnRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="drawer-overlay"
      onClick={onClose}
      data-testid="drawer-overlay"
      role="presentation"
    >
      <div
        className="reference-drawer-container"
        role="dialog"
        aria-modal="true"
        aria-label="Quick Reference Guide"
        onClick={(e) => e.stopPropagation()}
        data-testid="reference-drawer"
      >
        {/* Drawer Grab Handle & Header */}
        <div className="drawer-header">
          <div className="drawer-drag-handle" aria-hidden="true" />
          <div className="drawer-header-content">
            <div className="drawer-title-group">
              <span className="drawer-badge">
                Level {levelNumber || 1} • {behavior?.title}
              </span>
              <h2 className="drawer-title" data-testid="drawer-step-title">
                Step {step?.stepNumber || 1}: {step?.title}
              </h2>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              className="drawer-close-btn"
              onClick={onClose}
              aria-label="Close reference guide"
              data-testid="drawer-close-button"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="drawer-body" data-testid="drawer-body">
          {/* Current Step Pass Criterion */}
          <section className="drawer-section criterion-highlight-section">
            <h3 className="drawer-section-heading">🎯 Pass Criterion</h3>
            <p className="drawer-criterion-text" data-testid="drawer-criterion">
              {step?.criterionSummary}
            </p>
          </section>

          {/* Step Markdown Instructions */}
          {step?.instructionsMarkdown && (
            <section className="drawer-section" data-testid="drawer-instructions-section">
              <h3 className="drawer-section-heading">📖 Step Instructions</h3>
              <div className="drawer-markdown-content" data-testid="drawer-instructions">
                <MarkdownView content={step.instructionsMarkdown} />
              </div>
            </section>
          )}

          {/* Step Callouts */}
          {step?.callouts && step.callouts.length > 0 && (
            <section className="drawer-section" data-testid="drawer-step-callouts">
              <h3 className="drawer-section-heading">💡 Tips & Problem Solving</h3>
              <div className="callouts-stack">
                {step.callouts.map((callout, idx) => (
                  <CalloutCard
                    key={`${callout.type}-${idx}`}
                    callout={callout}
                    index={idx}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Try It Cold */}
          {step?.tryItCold && (
            <section className="drawer-section cold-test-section" data-testid="drawer-try-it-cold">
              <h3 className="drawer-section-heading">❄️ Try It Cold</h3>
              <div className="drawer-markdown-content">
                <MarkdownView content={step.tryItCold} />
              </div>
            </section>
          )}

          {/* Comeafters */}
          {step?.comeafters && (
            <section className="drawer-section comeafters-section" data-testid="drawer-comeafters">
              <h3 className="drawer-section-heading">🚀 Comeafters (Generalization)</h3>
              <div className="drawer-markdown-content">
                <MarkdownView content={step.comeafters} />
              </div>
            </section>
          )}

          {/* Comebefores */}
          {behavior?.comebefores && (
            <section className="drawer-section comebefores-section" data-testid="drawer-comebefores">
              <h3 className="drawer-section-heading">🧱 Comebefores (Prerequisites)</h3>
              <div className="drawer-markdown-content">
                <MarkdownView content={behavior.comebefores} />
              </div>
            </section>
          )}

          {/* Equipment */}
          {behavior?.equipment && (
            <section className="drawer-section equipment-section" data-testid="drawer-equipment">
              <h3 className="drawer-section-heading">🎒 Equipment & Setting Factors</h3>
              <div className="drawer-markdown-content">
                <MarkdownView content={behavior.equipment} />
              </div>
            </section>
          )}

          {/* Full Behavior Criteria Summary Table */}
          {behavior?.criteriaTable && behavior.criteriaTable.length > 0 && (
            <section className="drawer-section" data-testid="drawer-criteria-table">
              <h3 className="drawer-section-heading">📊 {behavior.title} Criteria Table</h3>
              <div className="criteria-table-wrapper">
                <table className="criteria-table">
                  <thead>
                    <tr>
                      <th scope="col" className="col-step">Step</th>
                      <th scope="col" className="col-criterion">Criterion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {behavior.criteriaTable.map((row) => {
                      const isActive = row.step === step?.stepNumber
                      return (
                        <tr
                          key={row.step}
                          className={isActive ? 'active-step-row' : ''}
                        >
                          <td className="step-cell">
                            {row.step}
                            {isActive && <span className="active-indicator"> (Current)</span>}
                          </td>
                          <td className="criterion-cell">{row.criteria}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Behavior-level Callouts (e.g. Intro notes/warnings) */}
          {behavior?.callouts && behavior.callouts.length > 0 && (
            <section className="drawer-section" data-testid="drawer-behavior-callouts">
              <h3 className="drawer-section-heading">📌 General Behavior Notes</h3>
              <div className="callouts-stack">
                {behavior.callouts.map((callout, idx) => (
                  <CalloutCard
                    key={`beh-${callout.type}-${idx}`}
                    callout={callout}
                    index={idx}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
