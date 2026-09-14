import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { HoldTimer } from '../src/components/HoldTimer'

describe('HoldTimer Component (Seam: Hold Timer)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders with preset target duration in idle state', () => {
    render(<HoldTimer targetSeconds={5} />)

    expect(screen.getByTestId('hold-timer')).toBeInTheDocument()
    expect(screen.getByTestId('timer-display')).toHaveTextContent('5s')
    expect(screen.getByRole('button', { name: /start|play/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('starts countdown on tap, updates remaining time, and completes with haptic feedback', () => {
    const onComplete = vi.fn()
    render(<HoldTimer targetSeconds={3} onComplete={onComplete} />)

    const startBtn = screen.getByRole('button', { name: /start|play/i })
    fireEvent.click(startBtn)

    // Running state
    expect(screen.getByTestId('timer-display')).toHaveTextContent('3s')

    // Advance 1 second
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByTestId('timer-display')).toHaveTextContent('2s')

    // Advance 2 more seconds to complete
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByTestId('timer-display')).toHaveTextContent('0s')
    expect(screen.getByTestId('hold-timer')).toHaveClass('timer-complete')

    // Expect haptic feedback and completion callback
    expect(navigator.vibrate).toHaveBeenCalledWith([200, 100, 200])
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('allows handler to pause and resume countdown', () => {
    render(<HoldTimer targetSeconds={10} />)

    const startBtn = screen.getByRole('button', { name: /start|play/i })
    fireEvent.click(startBtn)

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByTestId('timer-display')).toHaveTextContent('7s')

    // Tap pause
    const pauseBtn = screen.getByRole('button', { name: /pause/i })
    fireEvent.click(pauseBtn)

    // Time should not advance while paused
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByTestId('timer-display')).toHaveTextContent('7s')

    // Resume
    const resumeBtn = screen.getByRole('button', { name: /resume|start|play/i })
    fireEvent.click(resumeBtn)

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByTestId('timer-display')).toHaveTextContent('5s')
  })

  it('resets timer back to target duration when reset button is tapped', () => {
    render(<HoldTimer targetSeconds={5} />)

    const startBtn = screen.getByRole('button', { name: /start|play/i })
    fireEvent.click(startBtn)

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByTestId('timer-display')).toHaveTextContent('3s')

    const resetBtn = screen.getByRole('button', { name: /reset/i })
    fireEvent.click(resetBtn)

    expect(screen.getByTestId('timer-display')).toHaveTextContent('5s')
    expect(screen.getByRole('button', { name: /start|play/i })).toBeInTheDocument()
  })

  it('updates target duration when targetSeconds prop changes', () => {
    const { rerender } = render(<HoldTimer targetSeconds={5} />)
    expect(screen.getByTestId('timer-display')).toHaveTextContent('5s')

    rerender(<HoldTimer targetSeconds={10} />)
    expect(screen.getByTestId('timer-display')).toHaveTextContent('10s')
  })
})
