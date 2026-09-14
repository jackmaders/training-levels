import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ReferenceDrawer } from '../src/components/ReferenceDrawer'
import { CalloutCard } from '../src/components/CalloutCard'
import { MarkdownView } from '../src/components/MarkdownView'
import type { BehaviorData, StepData, Callout } from '../src/types/curriculum'

const mockStep: StepData = {
  id: 'level-1-zen-step-1',
  stepNumber: 1,
  title: 'Closed fist hand zen',
  criterionSummary: 'Dog moves away from treat in hand.',
  instructionsMarkdown: 'Start sitting down.\n\n- Hold treat in closed fist.\n- Wait for dog to back off.\n\n> Important reminder for trainers.',
  tryItCold: 'Test with hand out once.',
  comeafters: 'Try standing up in a new room.',
  callouts: [
    {
      type: 'tip',
      rawType: 'TIP',
      title: 'Training Tip',
      contentMarkdown: 'Hold your hand still.',
    },
    {
      type: 'warning',
      rawType: 'WARNING',
      title: 'Problem: Pawing',
      contentMarkdown: 'Wear gloves if dog paws hard.',
    },
    {
      type: 'quote',
      rawType: 'QUOTE',
      title: 'Sue Ailsby Quote',
      contentMarkdown: 'Think before you train.',
    },
    {
      type: 'note',
      rawType: 'NOTE',
      title: 'General Note',
      contentMarkdown: 'Keep sessions under 3 minutes.',
    },
  ],
}

const mockBehavior: BehaviorData = {
  id: 'level-1-zen',
  level: 1,
  behaviorKey: 'zen',
  title: 'Zen',
  order: 1,
  pages: '10-15',
  comebefores: 'Read the tools section first.',
  equipment: 'High value treats and a clicker.',
  thinkAbout: 'Patience and timing.',
  aboutCues: 'No verbal cue on step 1.',
  introMarkdown: 'Zen teaches self-control.',
  criteriaTable: [
    { step: 1, criteria: 'Dog moves away from closed hand.' },
    { step: 2, criteria: 'Dog waits 5 seconds.' },
    { step: 3, criteria: 'Dog waits with open hand.' },
    { step: 4, criteria: 'Dog waits with dish.' },
    { step: 5, criteria: 'Generalize to new locations.' },
  ],
  callouts: [],
  steps: [
    mockStep,
    { ...mockStep, stepNumber: 2, id: 'level-1-zen-step-2' },
    { ...mockStep, stepNumber: 3, id: 'level-1-zen-step-3' },
    { ...mockStep, stepNumber: 4, id: 'level-1-zen-step-4' },
    { ...mockStep, stepNumber: 5, id: 'level-1-zen-step-5' },
  ],
}

describe('MarkdownView Component', () => {
  it('renders markdown paragraphs, lists, bold, italics, and blockquotes', () => {
    const md = 'Paragraph with **bold** and *italic* and `code` text.\n\n- Item 1\n- Item 2\n\n> Blockquote text'
    const { container } = render(<MarkdownView content={md} />)

    expect(screen.getByText('bold')).toBeInTheDocument()
    expect(screen.getByText('italic')).toBeInTheDocument()
    expect(screen.getByText('code')).toBeInTheDocument()
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(container.querySelector('blockquote')).toHaveTextContent('Blockquote text')
  })
})

describe('CalloutCard Component', () => {
  it('renders callout with appropriate icon and class for different types', () => {
    const tipCallout: Callout = {
      type: 'tip',
      rawType: 'TIP',
      title: 'Pro Tip',
      contentMarkdown: 'Be consistent.',
    }
    const { rerender } = render(<CalloutCard callout={tipCallout} index={0} />)
    expect(screen.getByTestId('callout-card-tip-0')).toHaveClass('callout-tip')
    expect(screen.getByText('Pro Tip')).toBeInTheDocument()
    expect(screen.getByText('Be consistent.')).toBeInTheDocument()

    const warningCallout: Callout = {
      type: 'warning',
      rawType: 'WARNING',
      title: 'Caution Ahead',
      contentMarkdown: 'Avoid frustration.',
    }
    rerender(<CalloutCard callout={warningCallout} index={1} />)
    expect(screen.getByTestId('callout-card-warning-1')).toHaveClass('callout-warning')
    expect(screen.getByText('Caution Ahead')).toBeInTheDocument()
  })
})

describe('ReferenceDrawer Component', () => {
  it('renders null when isOpen is false', () => {
    const { container } = render(
      <ReferenceDrawer
        isOpen={false}
        onClose={vi.fn()}
        behavior={mockBehavior}
        step={mockStep}
        levelNumber={1}
      />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders full drawer details when isOpen is true', () => {
    render(
      <ReferenceDrawer
        isOpen={true}
        onClose={vi.fn()}
        behavior={mockBehavior}
        step={mockStep}
        levelNumber={1}
      />
    )

    expect(screen.getByRole('dialog', { name: /quick reference guide/i })).toBeInTheDocument()
    expect(screen.getByTestId('drawer-step-title')).toHaveTextContent('Step 1: Closed fist hand zen')
    expect(screen.getByTestId('drawer-criterion')).toHaveTextContent('Dog moves away from treat in hand.')
    expect(screen.getByTestId('drawer-instructions')).toBeInTheDocument()
    expect(screen.getByTestId('drawer-try-it-cold')).toHaveTextContent('Test with hand out once.')
    expect(screen.getByTestId('drawer-comeafters')).toHaveTextContent('Try standing up in a new room.')
    expect(screen.getByTestId('drawer-comebefores')).toHaveTextContent('Read the tools section first.')
    expect(screen.getByTestId('drawer-equipment')).toHaveTextContent('High value treats and a clicker.')

    // Criteria table renders 5 rows with step 1 marked as active
    expect(screen.getByTestId('drawer-criteria-table')).toBeInTheDocument()
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(6) // 1 header row + 5 data rows
  })

  it('closes on close button click, overlay backdrop click, and Escape key press', () => {
    const handleClose = vi.fn()
    render(
      <ReferenceDrawer
        isOpen={true}
        onClose={handleClose}
        behavior={mockBehavior}
        step={mockStep}
        levelNumber={1}
      />
    )

    // Click close button
    const closeBtn = screen.getByRole('button', { name: /close reference guide/i })
    fireEvent.click(closeBtn)
    expect(handleClose).toHaveBeenCalledTimes(1)

    // Click overlay
    const overlay = screen.getByTestId('drawer-overlay')
    fireEvent.click(overlay)
    expect(handleClose).toHaveBeenCalledTimes(2)

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(3)
  })
})
