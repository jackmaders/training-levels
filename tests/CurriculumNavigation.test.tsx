import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
import { App } from '../src/App'
import { TrainingDatabase } from '../src/db/index'
import trainingData from '../src/data/training-levels.json'
import type { TrainingLevelsData } from '../src/types/curriculum'

describe('Curriculum Explorer & Foundations Reference Library Integration', () => {
  let db: TrainingDatabase
  const curriculum = trainingData as unknown as TrainingLevelsData

  beforeEach(async () => {
    db = new TrainingDatabase('test-curriculum-nav-db-' + Math.random().toString(36).substring(2))
    await db.open()
  })

  it('navigates to Foundations chapters via navigation drawer and supports sequential chapter pagination', async () => {
    render(<App db={db} curriculumData={curriculum} />)

    await waitFor(() => {
      expect(screen.getByTestId('home-dashboard')).toBeInTheDocument()
    })

    // Open navigation drawer
    const navBtn = screen.getByTestId('dashboard-nav-toggle-btn')
    fireEvent.click(navBtn)

    await waitFor(() => {
      expect(screen.getByTestId('nav-drawer')).toBeInTheDocument()
    })

    // Click on Foundations Chapter 1
    const chapter1Link = screen.getByTestId('nav-link-foundation-01-foreword-and-welcome')
    fireEvent.click(chapter1Link)

    // Verify Chapter View renders chapter content
    await waitFor(() => {
      expect(screen.getByTestId('reference-chapter-view')).toBeInTheDocument()
      expect(screen.getByTestId('chapter-title')).toHaveTextContent(/Foreword & Welcome/i)
      expect(screen.getByTestId('chapter-markdown-content')).toBeInTheDocument()
    })

    // Click Next Chapter button
    const nextBtn = screen.getByTestId('next-chapter-btn')
    fireEvent.click(nextBtn)

    await waitFor(() => {
      expect(screen.getByTestId('chapter-title')).toHaveTextContent(/Why Are You Here\?/i)
    })
  })

  it('navigates to Appendices via navigation drawer and renders formatted content', async () => {
    render(<App db={db} curriculumData={curriculum} />)

    await waitFor(() => {
      expect(screen.getByTestId('home-dashboard')).toBeInTheDocument()
    })

    // Open navigation drawer
    fireEvent.click(screen.getByTestId('dashboard-nav-toggle-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('nav-drawer')).toBeInTheDocument()
    })

    // Click on Appendix A
    const appendixLink = screen.getByTestId('nav-link-appendix-appendix-a-leading-the-dance')
    fireEvent.click(appendixLink)

    await waitFor(() => {
      expect(screen.getByTestId('reference-chapter-view')).toBeInTheDocument()
      expect(screen.getByTestId('chapter-title')).toHaveTextContent(/Leading the Dance/i)
      expect(screen.getByTestId('chapter-category-badge')).toHaveTextContent(/Appendices/i)
    })
  })

  it('navigates to Level 1 view, renders full behavior list with step indicators, and navigates into Behavior detail', async () => {
    render(<App db={db} curriculumData={curriculum} />)

    await waitFor(() => {
      expect(screen.getByTestId('home-dashboard')).toBeInTheDocument()
    })

    // Quick level link on dashboard to Level 1
    const quickL1Btn = screen.getByTestId('quick-level-btn-1')
    fireEvent.click(quickL1Btn)

    // Verifies Level 1 View
    await waitFor(() => {
      expect(screen.getByTestId('level-view')).toBeInTheDocument()
      expect(screen.getByTestId('level-title')).toHaveTextContent(/Level 1/i)
    })

    // Verifies full behavior list for Level 1
    expect(screen.getByTestId('behavior-card-level-1-zen')).toBeInTheDocument()
    expect(screen.getByTestId('behavior-card-level-1-come')).toBeInTheDocument()
    expect(screen.getByTestId('behavior-card-level-1-sit')).toBeInTheDocument()
    expect(screen.getByTestId('behavior-card-level-1-target')).toBeInTheDocument()
    expect(screen.getByTestId('behavior-card-level-1-down')).toBeInTheDocument()

    // Verifies homework summary
    expect(screen.getByTestId('level-homework-section')).toBeInTheDocument()

    // Click into Zen behavior detail
    fireEvent.click(screen.getByTestId('view-behavior-btn-level-1-zen'))

    // Verifies Behavior Detail View
    await waitFor(() => {
      expect(screen.getByTestId('behavior-detail-view')).toBeInTheDocument()
      expect(screen.getByTestId('behavior-detail-title')).toHaveTextContent(/Zen/i)
      expect(screen.getByTestId('behavior-criteria-table-section')).toBeInTheDocument()
      expect(screen.getByTestId('step-card-level-1-zen-step-1')).toBeInTheDocument()
    })

    // Back to Level 1
    fireEvent.click(screen.getByTestId('back-to-level-btn'))
    await waitFor(() => {
      expect(screen.getByTestId('level-view')).toBeInTheDocument()
    })
  })

  it('deep links directly into InSessionTraining from direct step launchers in behavior detail view and returns with updated status', async () => {
    render(<App db={db} curriculumData={curriculum} />)

    await waitFor(() => {
      expect(screen.getByTestId('home-dashboard')).toBeInTheDocument()
    })

    // Navigate to Level 1 via drawer
    fireEvent.click(screen.getByTestId('dashboard-nav-toggle-btn'))
    await waitFor(() => {
      expect(screen.getByTestId('nav-drawer')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByTestId('nav-link-level-1'))

    await waitFor(() => {
      expect(screen.getByTestId('level-view')).toBeInTheDocument()
    })

    // Go to Zen behavior detail
    fireEvent.click(screen.getByTestId('view-behavior-btn-level-1-zen'))
    await waitFor(() => {
      expect(screen.getByTestId('behavior-detail-view')).toBeInTheDocument()
    })

    // Click Direct Step Launcher: Cold Test for Step 1
    const coldBtn = screen.getByTestId('start-cold-btn-level-1-zen-step-1')
    fireEvent.click(coldBtn)

    // Now inside InSessionTraining surface in Cold Test mode for Step 1
    await waitFor(() => {
      expect(screen.getByTestId('criterion-header')).toBeInTheDocument()
      expect(screen.getByTestId('behavior-title')).toHaveTextContent(/Zen/i)
      expect(screen.getByTestId('step-number')).toHaveTextContent(/Step 1/i)
    })

    // Log a passing rep in Cold Test
    const passBtn = screen.getByRole('button', { name: /pass/i })
    fireEvent.click(passBtn)

    await waitFor(() => {
      expect(screen.getByTestId('step-status-badge')).toHaveTextContent(/passed cold/i)
    })

    // Click back to return to previous surface (BehaviorDetailView)
    const backBtn = screen.getByRole('button', { name: /dashboard/i })
    fireEvent.click(backBtn)

    // Returns to BehaviorDetailView where Step 1 status is updated
    await waitFor(() => {
      expect(screen.getByTestId('behavior-detail-view')).toBeInTheDocument()
      expect(screen.getByTestId('step-progress-badge-level-1-zen-step-1')).toHaveTextContent(/passed cold/i)
    })
  })
})
