import React from 'react'

interface MarkdownRendererProps {
  text: string
}

function parseInline(content: string): React.ReactNode[] {
  // Regex to split by bold (**text**), inline code (`code`), and links ([text](url))
  const tokenRegex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g
  const parts = content.split(tokenRegex)
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-extrabold text-inherit">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code 
          key={index} 
          className="bg-zinc-950/80 text-rose-400 dark:text-rose-300 font-mono text-[12.5px] px-1.5 py-0.5 rounded border border-zinc-800/40 mx-0.5 font-semibold"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const closeBracketIdx = part.indexOf(']')
      const label = part.slice(1, closeBracketIdx)
      const url = part.slice(closeBracketIdx + 2, -1)
      return (
        <a 
          key={index} 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary dark:text-sky-400 underline hover:opacity-80 font-bold transition-opacity"
        >
          {label}
        </a>
      )
    }
    return part
  })
}

export default function MarkdownRenderer({ text }: MarkdownRendererProps) {
  if (!text) return null

  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  
  let currentListItems: React.ReactNode[] = []
  let isCodeBlock = false
  let codeLines: string[] = []
  let codeLang = ''

  const pushCurrentList = (key: number) => {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc pl-5 my-2 space-y-1 text-inherit">
          {currentListItems}
        </ul>
      )
      currentListItems = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code block check
    if (line.trim().startsWith('```')) {
      if (isCodeBlock) {
        // End of code block
        isCodeBlock = false
        const codeText = codeLines.join('\n')
        elements.push(
          <pre 
            key={`code-${i}`} 
            className="bg-zinc-950 text-zinc-100 border border-zinc-800/80 p-4 rounded-xl font-mono text-[13px] my-3 overflow-x-auto leading-relaxed shadow-sm"
          >
            {codeLang && (
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2 select-none border-b border-zinc-800 pb-1">
                {codeLang}
              </div>
            )}
            <code>{codeText}</code>
          </pre>
        )
        codeLines = []
      } else {
        // Start of code block
        isCodeBlock = true
        codeLang = line.trim().slice(3)
      }
      continue
    }

    if (isCodeBlock) {
      codeLines.push(line)
      continue
    }

    // List item check
    const listMatch = line.match(/^(\s*)[*+\-]\s+(.*)$/)
    if (listMatch) {
      const content = listMatch[2]
      currentListItems.push(
        <li key={`li-${i}`} className="leading-relaxed text-inherit">
          {parseInline(content)}
        </li>
      )
      continue
    }

    // If it's not a list item, push any active list we accumulated
    pushCurrentList(i)

    // Heading checks
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-2xl font-black mt-5 mb-2.5 text-inherit tracking-tight first:mt-1">
          {parseInline(line.slice(2))}
        </h1>
      )
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-xl font-extrabold mt-4 mb-2 text-inherit tracking-tight first:mt-1">
          {parseInline(line.slice(3))}
        </h2>
      )
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-lg font-bold mt-3 mb-1.5 text-inherit tracking-tight first:mt-1">
          {parseInline(line.slice(4))}
        </h3>
      )
    } else if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-base font-bold mt-2.5 mb-1.5 text-inherit tracking-tight first:mt-1">
          {parseInline(line.slice(5))}
        </h4>
      )
    } else if (line.startsWith('##### ')) {
      elements.push(
        <h5 key={`h5-${i}`} className="text-[14px] font-bold mt-2 mb-1 text-inherit tracking-tight first:mt-1">
          {parseInline(line.slice(6))}
        </h5>
      )
    } else if (line.startsWith('###### ')) {
      elements.push(
        <h6 key={`h6-${i}`} className="text-[12px] font-bold mt-2 mb-1 text-inherit tracking-tight first:mt-1">
          {parseInline(line.slice(7))}
        </h6>
      )
    } else if (line.trim() === '') {
      // Empty line, create small spacing
      elements.push(<div key={`space-${i}`} className="h-1.5" />)
    } else {
      // Regular paragraph
      elements.push(
        <p key={`p-${i}`} className="my-1.5 leading-relaxed text-inherit">
          {parseInline(line)}
        </p>
      )
    }
  }

  // Push final list if any
  pushCurrentList(lines.length)

  return <div className="markdown-body space-y-0.5">{elements}</div>
}
