import { useCallback, useMemo, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { createCommandHandlers } from './commands'
import type { CommandEntry, TerminalEntry, TerminalTone } from './types'

type TerminalSessionOptions = {
  onClear?: () => void
}

export const PROMPT = 'dev@group-dinner-picker:~$'
export const PROMPT_COLOR = 'text-emerald-400'

function buildId() {
  return Math.random().toString(36).slice(2, 10)
}

function createInitialEntries(): TerminalEntry[] {
  return [
    {
      id: buildId(),
      kind: 'output',
      tone: 'info',
      lines: [
        'Connected to Group Dinner Picker API shell.',
        'Type `help` to see available commands. Use quotes for multi-word names.',
      ],
    },
  ]
}

function tokenizeCommand(input: string): string[] {
  const tokens: string[] = []
  let current = ''
  let inQuotes = false
  let quoteChar = ''

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]

    if (inQuotes) {
      if (char === '\\' && i + 1 < input.length) {
        const next = input[i + 1]
        if (next === quoteChar || next === '\\') {
          current += next
          i += 1
        } else {
          current += char
        }
      } else if (char === quoteChar) {
        tokens.push(current)
        current = ''
        inQuotes = false
        quoteChar = ''
      } else {
        current += char
      }
      continue
    }

    if (char === '"' || char === '\'') {
      if (current) {
        tokens.push(current)
        current = ''
      }
      inQuotes = true
      quoteChar = char
      continue
    }

    if (char.trim() === '') {
      if (current) {
        tokens.push(current)
        current = ''
      }
      continue
    }

    current += char
  }

  if (inQuotes) {
    throw new Error('Unterminated quote detected. Close all quotes and try again.')
  }

  if (current) {
    tokens.push(current)
  }

  return tokens
}

export function useTerminalSession(options: TerminalSessionOptions = {}) {
  const { onClear } = options

  const [history, setHistory] = useState<TerminalEntry[]>(() => createInitialEntries())
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)

  const clearTerminal = useCallback(() => {
    setHistory(createInitialEntries())
    setHistoryIndex(null)
    setInput('')
    onClear?.()
  }, [onClear])

  const pushOutput = useCallback((tone: TerminalTone, lines: string[]) => {
    setHistory((prev) => [
      ...prev,
      {
        id: buildId(),
        kind: 'output',
        tone,
        lines,
      },
    ])
  }, [])

  const commandRunner = useMemo(
    () =>
      createCommandHandlers({
        pushOutput,
        clearTerminal,
      }),
    [pushOutput, clearTerminal]
  )

  const executeCommand = useCallback(
    async (value: string) => {
      let tokens: string[]
      try {
        tokens = tokenizeCommand(value)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to parse command'
        pushOutput('error', [message])
        return
      }

      if (tokens.length === 0) {
        return
      }

      const [command, ...args] = tokens
      const normalized = command.toLowerCase()

      try {
        const handled = await commandRunner.run(normalized, args)
        if (!handled) {
          pushOutput('error', [`Unknown command: ${command}`])
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unexpected error'
        pushOutput('error', [message])
      }
    },
    [commandRunner, pushOutput]
  )

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const trimmed = input.trim()
      if (!trimmed || isProcessing) {
        return
      }

      const commandEntry: CommandEntry = {
        id: buildId(),
        kind: 'command',
        prompt: PROMPT,
        command: trimmed,
      }

      setHistory((prev) => [...prev, commandEntry])
      setCommandHistory((prev) => [...prev, trimmed])
      setHistoryIndex(null)
      setInput('')

      try {
        setIsProcessing(true)
        await executeCommand(trimmed)
      } finally {
        setIsProcessing(false)
      }
    },
    [executeCommand, input, isProcessing]
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.ctrlKey && !event.altKey && !event.metaKey) {
        const lowerKey = event.key.toLowerCase()
        if (lowerKey === 'l' || lowerKey === 'c') {
          const inputHasSelection =
            event.currentTarget.selectionStart !== event.currentTarget.selectionEnd
          const globalSelection = window.getSelection()?.toString()
          if (lowerKey === 'c' && (globalSelection || inputHasSelection)) {
            return
          }
          event.preventDefault()
          clearTerminal()
          return
        }
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        if (commandHistory.length === 0) {
          return
        }

        const nextIndex = historyIndex === null ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(nextIndex)
        setInput(commandHistory[nextIndex])
      } else if (event.key === 'ArrowDown') {
        if (historyIndex === null) {
          return
        }
        event.preventDefault()
        const nextIndex = historyIndex + 1
        if (nextIndex >= commandHistory.length) {
          setHistoryIndex(null)
          setInput('')
        } else {
          setHistoryIndex(nextIndex)
          setInput(commandHistory[nextIndex])
        }
      }
    },
    [clearTerminal, commandHistory, historyIndex]
  )

  const handleInputChange = useCallback((value: string) => {
    setInput(value)
  }, [])

  return {
    history,
    input,
    isProcessing,
    handleSubmit,
    handleKeyDown,
    handleInputChange,
  }
}

export type { TerminalEntry, TerminalTone } from './types'
