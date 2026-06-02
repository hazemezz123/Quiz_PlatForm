import { useMemo } from 'react'
import { Stack, Text, Badge, Group } from '@mantine/core'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeRendererProps {
  text: string
  maxCodeWidth?: number
  textSize?: string
  dir?: 'rtl' | 'ltr'
}

function normalizeLang(lang: string): string {
  const map: Record<string, string> = {
    py: 'python',
    python3: 'python',
    js: 'javascript',
    ts: 'typescript',
    jsx: 'jsx',
    tsx: 'tsx',
    bash: 'bash',
    sh: 'bash',
    shell: 'bash',
    json: 'json',
    html: 'html',
    css: 'css',
    sql: 'sql',
    cpp: 'cpp',
    c: 'c',
    java: 'java',
    go: 'go',
    rust: 'rust',
  }
  return map[lang.toLowerCase()] || lang.toLowerCase()
}

function getLangColor(lang: string): string {
  switch (lang) {
    case 'python':
      return '#306998'
    case 'javascript':
    case 'js':
      return '#F7DF1E'
    case 'typescript':
      return '#3178C6'
    case 'java':
      return '#E76F00'
    case 'cpp':
    case 'c':
      return '#00599C'
    case 'go':
      return '#00ADD8'
    case 'rust':
      return '#DEA584'
    case 'html':
      return '#E34F26'
    case 'css':
      return '#1572B6'
    case 'sql':
      return '#336791'
    default:
      return 'var(--mantine-color-teal-6)'
  }
}

function getLangLabel(lang: string): string {
  const map: Record<string, string> = {
    python: 'Python',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    go: 'Go',
    rust: 'Rust',
    html: 'HTML',
    css: 'CSS',
    sql: 'SQL',
    bash: 'Bash',
    json: 'JSON',
  }
  return map[lang] || lang.charAt(0).toUpperCase() + lang.slice(1)
}

export function CodeRenderer({ text, maxCodeWidth = 280, textSize = 'sm', dir = 'ltr' }: CodeRendererProps) {
  const parts = useMemo(() => {
    const regex = /```(\w+)?\n([\s\S]*?)```/g
    const result: { type: 'text' | 'code'; content: string; lang: string }[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        result.push({ type: 'text', content: text.slice(lastIndex, match.index), lang: 'text' })
      }
      result.push({ type: 'code', content: match[2], lang: normalizeLang(match[1] || 'text') })
      lastIndex = regex.lastIndex
    }

    if (lastIndex < text.length) {
      result.push({ type: 'text', content: text.slice(lastIndex), lang: 'text' })
    }

    if (result.length === 0) {
      result.push({ type: 'text', content: text, lang: 'text' })
    }

    return result
  }, [text])

  return (
    <Stack gap="xs" dir={dir}>
      {parts.map((part, i) =>
        part.type === 'code' ? (
          <div
            key={i}
            style={{
              maxWidth: maxCodeWidth,
              borderRadius: 'var(--mantine-radius-md)',
              overflow: 'hidden',
              fontSize: '0.75rem',
              border: '1px solid var(--mantine-color-dark-5)',
            }}
          >
            {/* Code block header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.35rem 0.75rem',
                background: 'var(--mantine-color-dark-7)',
                borderBottom: '1px solid var(--mantine-color-dark-5)',
              }}
            >
              <Group gap="xs">
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: getLangColor(part.lang),
                  }}
                />
                <Text size="xs" fw={600} c="gray.4">
                  {getLangLabel(part.lang)}
                </Text>
              </Group>
              <Badge size="xs" variant="light" color="gray">
                code
              </Badge>
            </div>

            <SyntaxHighlighter
              language={part.lang}
              style={oneDark}
              customStyle={{
                margin: 0,
                padding: '0.75rem',
                fontSize: '0.8rem',
                borderRadius: 0,
                background: '#1e1e1e',
              }}
              wrapLines
              wrapLongLines
              showLineNumbers
              lineNumberStyle={{
                minWidth: '2em',
                paddingRight: '1em',
                color: 'var(--mantine-color-dark-3)',
                fontSize: '0.75rem',
              }}
            >
              {part.content}
            </SyntaxHighlighter>
          </div>
        ) : (
          <Text key={i} size={textSize} dir={dir} style={{ whiteSpace: 'pre-wrap', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
            {part.content}
          </Text>
        )
      )}
    </Stack>
  )
}
