import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { NavigationDrawer } from '../src/components/NavigationDrawer'
import trainingData from '../src/data/training-levels.json'
import type { TrainingLevelsData } from '../src/types/curriculum'

describe('NavigationDrawer Component', () => {
  const curriculum = trainingData as unknown as TrainingLevelsData

  it('renders null when isOpen is false', () => {
    const { container } = render(
      <NavigationDrawer
        isOpen={false}
        onClose={vi.fn()}
        curriculumData={curriculum}
        onNavigate={vi.fn()}
      />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders structured sections for Foundations, Levels 1-4, and Appendices when open', () => {
    render(
      <NavigationDrawer
        isOpen={true}
        onClose={vi.fn()}
        curriculumData={curriculum}
        onNavigate={vi.fn()}
      />
    )

    expect(screen.getByRole('dialog', { name: /curriculum navigation/i })).toBeInTheDocument()

    // Dashboard link
    expect(screen.getByTestId('nav-link-dashboard')).toBeInTheDocument()

    // Foundations list
    expect(screen.getByText('Foundations')).toBeInTheDocument()
    expect(screen.getByTestId('nav-link-foundation-01-foreword-and-welcome')).toHaveTextContent('Foreword & Welcome')
    expect(screen.getByTestId('nav-link-foundation-06-the-thinking-of-training')).toHaveTextContent('The Thinking of Training')

    // Levels 1-4 list
    expect(screen.getByText(/levels 1–4/i)).toBeInTheDocument()
    expect(screen.getByTestId('nav-link-level-1')).toHaveTextContent('Level 1')
    expect(screen.getByTestId('nav-link-level-2')).toHaveTextContent('Level 2')
    expect(screen.getByTestId('nav-link-level-3')).toHaveTextContent('Level 3')
    expect(screen.getByTestId('nav-link-level-4')).toHaveTextContent('Level 4')

    // Appendices list
    expect(screen.getByText('Appendices')).toBeInTheDocument()
    expect(screen.getByTestId('nav-link-appendix-appendix-a-leading-the-dance')).toHaveTextContent(/leading the dance/i)
  })

  it('triggers onNavigate and onClose when clicking navigation links', () => {
    const handleNavigate = vi.fn()
    const handleClose = vi.fn()

    render(
      <NavigationDrawer
        isOpen={true}
        onClose={handleClose}
        curriculumData={curriculum}
        onNavigate={handleNavigate}
      />
    )

    // Click Level 1 link
    fireEvent.click(screen.getByTestId('nav-link-level-1'))
    expect(handleNavigate).toHaveBeenCalledWith({ type: 'level', levelNumber: 1 })
    expect(handleClose).toHaveBeenCalled()

    // Click a Foundation link
    fireEvent.click(screen.getByTestId('nav-link-foundation-01-foreword-and-welcome'))
    expect(handleNavigate).toHaveBeenCalledWith({
      type: 'chapter',
      chapterId: '01-foreword-and-welcome',
      category: 'foundation',
    })

    // Click an Appendix link
    fireEvent.click(screen.getByTestId('nav-link-appendix-appendix-a-leading-the-dance'))
    expect(handleNavigate).toHaveBeenCalledWith({
      type: 'chapter',
      chapterId: 'appendix-a-leading-the-dance',
      category: 'appendix',
    })

    // Click Dashboard link
    fireEvent.click(screen.getByTestId('nav-link-dashboard'))
    expect(handleNavigate).toHaveBeenCalledWith({ type: 'dashboard' })
  })

  it('closes on Escape key and close button click', () => {
    const handleClose = vi.fn()
    render(
      <NavigationDrawer
        isOpen={true}
        onClose={handleClose}
        curriculumData={curriculum}
        onNavigate={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /close navigation/i }))
    expect(handleClose).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(2)
  })
})
