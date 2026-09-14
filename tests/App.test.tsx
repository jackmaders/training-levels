import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
import { App } from '../src/App'
import { TrainingDatabase } from '../src/db/index'

describe('Two-Surface Application Integration (Dashboard <-> InSessionTraining)', () => {
  let db: TrainingDatabase

  beforeEach(async () => {
    db = new TrainingDatabase('test-app-db-' + Math.random().toString(36).substring(2))
    await db.open()
  })

  it('initially renders the Home Dashboard surface', async () => {
    render(<App db={db} />)

    await waitFor(() => {
      expect(screen.getByTestId('home-dashboard')).toBeInTheDocument()
      expect(screen.getByTestId('recommended-hero-card')).toBeInTheDocument()
    })
  })

  it('transitions to InSessionTraining surface when starting a drill and allows navigating back to Dashboard', async () => {
    render(<App db={db} />)

    await waitFor(() => {
      expect(screen.getByTestId('recommended-hero-card')).toBeInTheDocument()
    })

    // Click Start Practice Drill
    const startBtn = screen.getByRole('button', { name: /start practice drill/i })
    fireEvent.click(startBtn)

    // Now in InSessionTraining surface
    await waitFor(() => {
      expect(screen.getByTestId('criterion-header')).toBeInTheDocument()
      expect(screen.getByTestId('rep-matrix')).toBeInTheDocument()
    })

    // Click Back to Dashboard
    const backBtn = screen.getByRole('button', { name: /dashboard/i })
    fireEvent.click(backBtn)

    // Back on Dashboard
    await waitFor(() => {
      expect(screen.getByTestId('home-dashboard')).toBeInTheDocument()
    })
  })

  it('completing a cold test updates step to passed_cold and displays in dashboard session history', async () => {
    render(<App db={db} />)

    await waitFor(() => {
      expect(screen.getByTestId('recommended-hero-card')).toBeInTheDocument()
    })

    // Switch to Cold Test mode on Hero Card and Start
    fireEvent.click(screen.getByRole('button', { name: /cold test/i }))
    fireEvent.click(screen.getByRole('button', { name: /start cold test/i }))

    await waitFor(() => {
      expect(screen.getByTestId('criterion-header')).toBeInTheDocument()
    })

    // Log a pass in Cold Test
    const passBtn = screen.getByRole('button', { name: /pass/i })
    fireEvent.click(passBtn)

    await waitFor(() => {
      expect(screen.getByTestId('step-status-badge')).toHaveTextContent(/passed cold/i)
    })

    // Return to Dashboard
    const backBtn = screen.getByRole('button', { name: /dashboard/i })
    fireEvent.click(backBtn)

    await waitFor(() => {
      expect(screen.getByTestId('home-dashboard')).toBeInTheDocument()
      expect(screen.getByTestId('session-history-feed')).toBeInTheDocument()
    })

    // Check that recent session history shows the Passed Cold entry
    const historyCards = screen.getAllByTestId(/^session-log-card-/)
    expect(historyCards[0]).toHaveTextContent(/passed cold/i)

    // And the hero card recommendation has dynamically advanced to Step 2!
    expect(screen.getByTestId('hero-step-number')).toHaveTextContent('Step 2')
  })
})
