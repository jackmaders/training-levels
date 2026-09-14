import React, { useEffect, useRef, useState } from 'react'
import type { TrainingLevelsData } from '../types/curriculum'
import './NavigationDrawer.css'

export type AppNavTarget =
  | { type: 'dashboard' }
  | { type: 'level'; levelNumber: number }
  | { type: 'behavior'; levelNumber: number; behaviorKey: string }
  | { type: 'chapter'; chapterId: string; category: 'foundation' | 'appendix' }
  | { type: 'training'; stepId: string; mode: 'practice' | 'cold' }

export interface NavigationDrawerProps {
  isOpen: boolean
  onClose: () => void
  curriculumData: TrainingLevelsData
  onNavigate: (target: AppNavTarget) => void
  activeTarget?: AppNavTarget
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  curriculumData,
  onNavigate,
  activeTarget,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: false,
    4: false,
  })

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

  const toggleLevelExpand = (lvlNum: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedLevels((prev) => ({
      ...prev,
      [lvlNum]: !prev[lvlNum],
    }))
  }

  const handleLinkClick = (target: AppNavTarget) => {
    onNavigate(target)
    onClose()
  }

  return (
    <div
      className="nav-drawer-overlay"
      onClick={onClose}
      data-testid="nav-drawer-overlay"
      role="presentation"
    >
      <div
        className="nav-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Curriculum Navigation"
        onClick={(e) => e.stopPropagation()}
        data-testid="nav-drawer"
      >
        <div className="nav-drawer-header">
          <div className="nav-drawer-brand">
            <span className="nav-drawer-logo">🐕</span>
            <div>
              <h2 className="nav-drawer-title">Training Levels</h2>
              <span className="nav-drawer-subtitle">Curriculum &amp; Library</span>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="nav-drawer-close-btn"
            onClick={onClose}
            aria-label="Close navigation"
            data-testid="nav-drawer-close-btn"
          >
            ✕
          </button>
        </div>

        <nav className="nav-drawer-scroll-area">
          {/* Dashboard Home Link */}
          <div className="nav-section">
            <button
              type="button"
              className={`nav-item-btn nav-dashboard-btn ${
                activeTarget?.type === 'dashboard' ? 'active' : ''
              }`}
              onClick={() => handleLinkClick({ type: 'dashboard' })}
              data-testid="nav-link-dashboard"
            >
              <span className="nav-icon">🏠</span>
              <span className="nav-label">Dashboard</span>
            </button>
          </div>

          {/* Curriculum Levels 1-4 */}
          <div className="nav-section">
            <div className="nav-section-header">
              <span className="nav-section-title">Levels 1–4 Curriculum</span>
            </div>
            <div className="nav-levels-list">
              {curriculumData.levels.map((lvl) => {
                const isExpanded = !!expandedLevels[lvl.level]
                const isLevelActive =
                  activeTarget?.type === 'level' && activeTarget.levelNumber === lvl.level

                return (
                  <div key={lvl.level} className="nav-level-group">
                    <div className="nav-level-row">
                      <button
                        type="button"
                        className={`nav-item-btn nav-level-btn ${
                          isLevelActive ? 'active' : ''
                        }`}
                        onClick={() =>
                          handleLinkClick({ type: 'level', levelNumber: lvl.level })
                        }
                        data-testid={`nav-link-level-${lvl.level}`}
                      >
                        <span className="nav-level-badge">L{lvl.level}</span>
                        <span className="nav-label">
                          Level {lvl.level}: {lvl.title.replace(/^Level \d+:? ?/i, '') || 'Track'}
                        </span>
                        <span className="nav-count-badge">
                          {lvl.behaviors.length} behaviors
                        </span>
                      </button>
                      <button
                        type="button"
                        className="nav-expand-btn"
                        onClick={(e) => toggleLevelExpand(lvl.level, e)}
                        aria-label={`Toggle Level ${lvl.level} behaviors list`}
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? '▾' : '▸'}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="nav-sub-items">
                        {lvl.behaviors.map((beh) => {
                          const isBehaviorActive =
                            activeTarget?.type === 'behavior' &&
                            activeTarget.levelNumber === lvl.level &&
                            activeTarget.behaviorKey === beh.behaviorKey

                          return (
                            <button
                              key={beh.id}
                              type="button"
                              className={`nav-sub-item-btn ${
                                isBehaviorActive ? 'active' : ''
                              }`}
                              onClick={() =>
                                handleLinkClick({
                                  type: 'behavior',
                                  levelNumber: lvl.level,
                                  behaviorKey: beh.behaviorKey,
                                })
                              }
                              data-testid={`nav-link-behavior-${beh.id}`}
                            >
                              <span className="sub-item-bullet">•</span>
                              <span className="sub-item-title">{beh.title}</span>
                              <span className="sub-item-steps-badge">
                                {beh.steps.length} steps
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Foundations Reference Library */}
          <div className="nav-section">
            <div className="nav-section-header">
              <span className="nav-section-title">Foundations</span>
              <span className="nav-section-subtitle">Vol 1 &amp; 2 Principles</span>
            </div>
            <div className="nav-items-list">
              {curriculumData.foundations.map((foundation) => {
                const isChapterActive =
                  activeTarget?.type === 'chapter' &&
                  activeTarget.category === 'foundation' &&
                  activeTarget.chapterId === foundation.id

                return (
                  <button
                    key={foundation.id}
                    type="button"
                    className={`nav-item-btn ${isChapterActive ? 'active' : ''}`}
                    onClick={() =>
                      handleLinkClick({
                        type: 'chapter',
                        chapterId: foundation.id,
                        category: 'foundation',
                      })
                    }
                    data-testid={`nav-link-foundation-${foundation.id}`}
                  >
                    <span className="nav-icon">📖</span>
                    <span className="nav-label">{foundation.title}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Appendices */}
          <div className="nav-section">
            <div className="nav-section-header">
              <span className="nav-section-title">Appendices</span>
              <span className="nav-section-subtitle">Guides &amp; Resources</span>
            </div>
            <div className="nav-items-list">
              {curriculumData.appendices.map((appendix) => {
                const isAppendixActive =
                  activeTarget?.type === 'chapter' &&
                  activeTarget.category === 'appendix' &&
                  activeTarget.chapterId === appendix.id

                return (
                  <button
                    key={appendix.id}
                    type="button"
                    className={`nav-item-btn ${isAppendixActive ? 'active' : ''}`}
                    onClick={() =>
                      handleLinkClick({
                        type: 'chapter',
                        chapterId: appendix.id,
                        category: 'appendix',
                      })
                    }
                    data-testid={`nav-link-appendix-${appendix.id}`}
                  >
                    <span className="nav-icon">📑</span>
                    <span className="nav-label">{appendix.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </nav>
      </div>
    </div>
  )
}

export default NavigationDrawer
