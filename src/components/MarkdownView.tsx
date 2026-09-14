import React from 'react'

export interface MarkdownViewProps {
  content: string
  className?: string
}

function parseInlineMarkdown(text: string): React.ReactNode[] {
  // Matches **bold**, *italic*, `code`, and newlines
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\n)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    const token = match[0]
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<strong key={match.index}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={match.index}>{token.slice(1, -1)}</em>)
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(<code key={match.index}>{token.slice(1, -1)}</code>)
    } else if (token === '\n') {
      parts.push(<br key={match.index} />)
    }

    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts
}

function renderList(
  items: string[],
  ordered: boolean,
  keyPrefix: number
): React.ReactNode {
  const ListTag = ordered ? 'ol' : 'ul'
  const listClass = ordered ? 'markdown-ordered-list' : 'markdown-list'
  return (
    <ListTag key={keyPrefix} className={listClass}>
      {items.map((item, itemIdx) => (
        <li key={itemIdx}>{parseInlineMarkdown(item)}</li>
      ))}
    </ListTag>
  )
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({
  content,
  className = '',
}) => {
  if (!content) return null

  // Split into block elements by double newlines
  const rawBlocks = content.split(/\r?\n\r?\n/)

  return (
    <div className={`markdown-rendered ${className}`}>
      {rawBlocks.map((block, blockIdx) => {
        const trimmed = block.trim()
        if (!trimmed) return null

        const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean)

        // Unordered list block
        if (lines.length > 0 && lines.every((line) => line.startsWith('- ') || line.startsWith('* '))) {
          const items = lines.map((line) => line.replace(/^[-*]\s+/, ''))
          return renderList(items, false, blockIdx)
        }

        // Ordered list block
        if (lines.length > 0 && lines.every((line) => /^\d+\.\s+/.test(line))) {
          const items = lines.map((line) => line.replace(/^\d+\.\s+/, ''))
          return renderList(items, true, blockIdx)
        }

        // Blockquote
        if (trimmed.startsWith('>')) {
          const quoteText = lines
            .map((line) => line.replace(/^>\s?/, ''))
            .join('\n')
          return (
            <blockquote key={blockIdx} className="markdown-blockquote">
              {parseInlineMarkdown(quoteText)}
            </blockquote>
          )
        }

        // Standard Paragraph
        return (
          <p key={blockIdx} className="markdown-paragraph">
            {parseInlineMarkdown(trimmed)}
          </p>
        )
      })}
    </div>
  )
}
