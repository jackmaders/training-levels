import React from 'react'
import type {
  TrainingLevelsData,
  FoundationItem,
  AppendixItem,
} from '../types/curriculum'
import { MarkdownView } from './MarkdownView'
import { CalloutCard } from './CalloutCard'
import './ReferenceChapterView.css'

export interface ReferenceChapterViewProps {
  chapterId: string
  category: 'foundation' | 'appendix'
  curriculumData: TrainingLevelsData
  onNavigateChapter: (chapterId: string, category: 'foundation' | 'appendix') => void
  onOpenNav?: () => void
  onBackToDashboard?: () => void
}

export const ReferenceChapterView: React.FC<ReferenceChapterViewProps> = ({
  chapterId,
  category,
  curriculumData,
  onNavigateChapter,
  onOpenNav,
  onBackToDashboard,
}) => {
  const chapterList: (FoundationItem | AppendixItem)[] =
    category === 'foundation'
      ? curriculumData.foundations
      : curriculumData.appendices

  const currentIndex = chapterList.findIndex((item) => item.id === chapterId)
  const currentChapter = chapterList[currentIndex >= 0 ? currentIndex : 0]

  if (!currentChapter) {
    return (
      <div className="chapter-view-error">
        <h2>Chapter not found</h2>
        {onBackToDashboard && (
          <button type="button" onClick={onBackToDashboard}>
            Back to Dashboard
          </button>
        )}
      </div>
    )
  }

  const prevChapter = currentIndex > 0 ? chapterList[currentIndex - 1] : null
  const nextChapter =
    currentIndex < chapterList.length - 1 ? chapterList[currentIndex + 1] : null

  return (
    <div className="reference-chapter-container" data-testid="reference-chapter-view">
      {/* Chapter Top Header */}
      <header className="chapter-header">
        <div className="chapter-header-top">
          <div className="chapter-nav-actions">
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
          <span
            className="chapter-category-badge"
            data-testid="chapter-category-badge"
          >
            {category === 'foundation' ? 'Foundations' : 'Appendices'}
          </span>
        </div>

        <div className="chapter-title-group">
          <div className="chapter-meta-row">
            {currentChapter.volume && (
              <span className="chapter-volume-tag">Volume {currentChapter.volume}</span>
            )}
            {currentChapter.pages && (
              <span className="chapter-pages-tag">
                Pages: {String(currentChapter.pages)}
              </span>
            )}
          </div>
          <h1 className="chapter-title" data-testid="chapter-title">
            {currentChapter.title}
          </h1>
        </div>
      </header>

      {/* Chapter Content Main */}
      <main className="chapter-content">
        {/* Formatted Chapter Markdown Body */}
        <article
          className="chapter-markdown-card"
          data-testid="chapter-markdown-content"
        >
          <MarkdownView content={currentChapter.contentMarkdown} />
        </article>

        {/* Formatted Chapter Callouts */}
        {currentChapter.callouts && currentChapter.callouts.length > 0 && (
          <section
            className="chapter-callouts-section"
            data-testid="chapter-callouts-section"
          >
            <h2 className="callouts-section-heading">
              <span className="heading-icon">💡</span> Notes &amp; Highlights
            </h2>
            <div className="callouts-stack">
              {currentChapter.callouts.map((callout, idx) => (
                <CalloutCard
                  key={`${callout.type}-${idx}`}
                  callout={callout}
                  index={idx}
                />
              ))}
            </div>
          </section>
        )}

        {/* Sequential Navigation Footer */}
        <footer className="chapter-pagination-footer">
          {prevChapter ? (
            <button
              type="button"
              className="chapter-page-btn prev-btn"
              onClick={() => onNavigateChapter(prevChapter.id, category)}
              data-testid="prev-chapter-btn"
            >
              <span className="btn-dir">← Previous</span>
              <span className="btn-title">{prevChapter.title}</span>
            </button>
          ) : (
            <div className="btn-placeholder" />
          )}

          {nextChapter ? (
            <button
              type="button"
              className="chapter-page-btn next-btn"
              onClick={() => onNavigateChapter(nextChapter.id, category)}
              data-testid="next-chapter-btn"
            >
              <span className="btn-dir">Next →</span>
              <span className="btn-title">{nextChapter.title}</span>
            </button>
          ) : (
            <div className="btn-placeholder" />
          )}
        </footer>
      </main>
    </div>
  )
}

export default ReferenceChapterView
