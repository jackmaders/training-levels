import React, { useState, useEffect, useRef, useCallback } from 'react'
import './HoldTimer.css'

export interface HoldTimerProps {
  targetSeconds: number
  onComplete?: () => void
  autoTriggerHaptic?: boolean
}

export const HoldTimer: React.FC<HoldTimerProps> = ({
  targetSeconds,
  onComplete,
  autoTriggerHaptic = true,
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(targetSeconds)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)

  // Keep callback refs
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Update when targetSeconds prop changes
  useEffect(() => {
    setRemainingSeconds(targetSeconds)
    setIsRunning(false)
    setIsCompleted(false)
  }, [targetSeconds])

  const triggerHaptic = useCallback(() => {
    if (
      autoTriggerHaptic &&
      typeof navigator !== 'undefined' &&
      typeof navigator.vibrate === 'function'
    ) {
      try {
        navigator.vibrate([200, 100, 200])
      } catch {
        // Safe fallback if vibration fails or is disabled
      }
    }
  }, [autoTriggerHaptic])

  // Timer countdown ticker (pure state updates)
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  // Handle completion side-effects safely outside the state updater
  useEffect(() => {
    if (isRunning && remainingSeconds === 0) {
      setIsRunning(false)
      setIsCompleted(true)
      triggerHaptic()
      if (onCompleteRef.current) {
        onCompleteRef.current()
      }
    }
  }, [isRunning, remainingSeconds, triggerHaptic])

  const handleTogglePlay = () => {
    if (isCompleted || remainingSeconds <= 0) {
      setRemainingSeconds(targetSeconds)
      setIsCompleted(false)
      setIsRunning(true)
    } else {
      setIsRunning((prev) => !prev)
    }
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsCompleted(false)
    setRemainingSeconds(targetSeconds)
  }

  // Format seconds into display string, e.g. "5s"
  const formatTime = (seconds: number): string => {
    return `${seconds}s`
  }

  return (
    <div
      className={`hold-timer-container ${isRunning ? 'timer-running' : ''} ${
        isCompleted ? 'timer-complete' : ''
      }`}
      data-testid="hold-timer"
    >
      <div className="hold-timer-left">
        <span className="hold-timer-label">Hold Timer</span>
        <div className="hold-timer-display" data-testid="timer-display">
          {formatTime(remainingSeconds)}
        </div>
      </div>

      <div className="hold-timer-controls">
        <button
          type="button"
          className={`timer-control-btn primary-timer-btn ${
            isRunning ? 'pause-btn' : 'start-btn'
          }`}
          onClick={handleTogglePlay}
          aria-label={
            isRunning
              ? 'Pause timer'
              : remainingSeconds < targetSeconds && !isCompleted
              ? 'Resume timer'
              : 'Start timer'
          }
        >
          {isRunning ? (
            <>
              <span className="timer-btn-icon">⏸</span>
              <span className="timer-btn-text">Pause</span>
            </>
          ) : (
            <>
              <span className="timer-btn-icon">▶</span>
              <span className="timer-btn-text">
                {remainingSeconds < targetSeconds && !isCompleted
                  ? 'Resume'
                  : 'Start'}
              </span>
            </>
          )}
        </button>

        <button
          type="button"
          className="timer-control-btn reset-timer-btn"
          onClick={handleReset}
          aria-label="Reset timer"
        >
          <span className="timer-btn-icon">↺</span>
          <span className="timer-btn-text">Reset</span>
        </button>
      </div>
    </div>
  )
}

export default HoldTimer
