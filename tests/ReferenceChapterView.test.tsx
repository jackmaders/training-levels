import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ReferenceChapterView } from '../src/components/ReferenceChapterView'
import trainingData from '../src/data/training-levels.json'
import type { TrainingLevelsData } from '../src/types/curriculum'

describe('ReferenceChapterView Component', () => {
  const curriculum = trainingData as unknown as TrainingLevelsData

  it('renders a Foundation chapter with markdown content, callouts, and volume/pages info', () => {
    const onNavigateChapter = vi.fn()
    const onOpenNav = vi.fn()

    render(
      <ReferenceChapterView
        chapterId="01-foreword-and-welcome"
        category="foundation"
        curriculumData={curriculum}
        onNavigateChapter={onNavigateChapter}
        onOpenNav={onOpenNav}
      />
    )

    expect(screen.getByTestId('reference-chapter-view')).toBeInTheDocument()
    expect(screen.getByTestId('chapter-title')).toHaveTextContent(/Foreword & Welcome/i)
    expect(screen.getByTestId('chapter-category-badge')).toHaveTextContent(/Foundations/i)

    // Markdown rendered content
    expect(screen.getByTestId('chapter-markdown-content')).toBeInTheDocument()

    // Previous / Next buttons
    const nextBtn = screen.getByTestId('next-chapter-btn')
    expect(nextBtn).toBeInTheDocument()
    fireEvent.click(nextBtn)
    expect(onNavigateChapter).toHaveBeenCalledWith('02-why-are-you-here', 'foundation')

    // Nav toggle
    fireEvent.click(screen.getByTestId('nav-toggle-btn'))
    expect(onOpenNav).toHaveBeenCalled()
  })

  it('renders an Appendix chapter with formatted content and callouts', () => {
    const onNavigateChapter = vi.fn()

    render(
      <ReferenceChapterView
        chapterId="appendix-a-leading-the-dance"
        category="appendix"
        curriculumData={curriculum}
        onNavigateChapter={onNavigateChapter}
      />
    )

    expect(screen.getByTestId('chapter-title')).toHaveTextContent(/Leading the Dance/i)
    expect(screen.getByTestId('chapter-category-badge')).toHaveTextContent(/Appendices/i)
    expect(screen.getByTestId('chapter-markdown-content')).toBeInTheDocument()
  })
})
