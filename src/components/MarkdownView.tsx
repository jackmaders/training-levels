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

export const MarkdownView: React.FC<MarkdownViewProps> = ({
  content,
  className = '',
}) => {
  if (!content) return null

  // Split into block elements by double newlines or list markers
  const rawBlocks = content.split(/\r?\n\r?\n/)

  return (
    <div className={`markdown-rendered ${className}`}>
      {rawBlocks.map((block, blockIdx) => {
        const trimmed = block.trim()
        if (!trimmed) return null

        // Unordered list block
        if (
          trimmed.split('\n').every((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '))
        ) {
          const items = trimmed.split('\n').map((line) => line.trim().replace(/^[-*]\s+/, ''))
          return (
            <ul key={blockIdx} className="markdown-list">
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>{parseInlineMarkdown(item)}</li>
              ))}
            </ul>
          )
        }

        // Ordered list block
        if (
          trimmed.split('\n').every((line) => /^\d+\.\s+/.test(line.trim()))
        ) {
          const items = trimmed.split('\n').map((line) => line.trim().replace(/^\d+\.\s+/, ''))
          return (
            <ol key={blockIdx} className="markdown-ordered-list">
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>{parseInlineMarkdown(item)}</li>
              ))}
            </ol>
          )
        }

        // Blockquote
        if (trimmed.startsWith('>')) {
          const quoteText = trimmed
            .split('\n')
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
