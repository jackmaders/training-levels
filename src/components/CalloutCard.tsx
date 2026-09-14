import React from 'react'
import type { Callout, CalloutType } from '../types/curriculum'
import { MarkdownView } from './MarkdownView'

export interface CalloutCardProps {
  callout: Callout
  index: number
  className?: string
}

const CALLOUT_ICONS: Record<CalloutType, string> = {
  tip: '💡',
  warning: '⚠️',
  note: 'ℹ️',
  quote: '💬',
  important: '📌',
  caution: '🛑',
}

const CALLOUT_TITLES: Record<CalloutType, string> = {
  tip: 'Training Tip',
  warning: 'Problem / Warning',
  note: 'Note',
  quote: 'Quote',
  important: 'Important',
  caution: 'Caution',
}

export const CalloutCard: React.FC<CalloutCardProps> = ({
  callout,
  index,
  className = '',
}) => {
  const icon = CALLOUT_ICONS[callout.type] || 'ℹ️'
  const fallbackTitle = CALLOUT_TITLES[callout.type] || 'Note'
  const displayTitle = callout.title || fallbackTitle

  return (
    <div
      className={`callout-card callout-${callout.type} ${className}`}
      data-testid={`callout-card-${callout.type}-${index}`}
    >
      <div className="callout-header">
        <span className="callout-icon" aria-hidden="true">
          {icon}
        </span>
        <h4 className="callout-title">{displayTitle}</h4>
      </div>
      <div className="callout-body">
        <MarkdownView content={callout.contentMarkdown} />
      </div>
    </div>
  )
}
