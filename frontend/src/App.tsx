import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import type { Option } from './api'
import {
  createOption,
  deleteOption,
  getHealth,
  getLockState,
  getOptions,
  getStats,
  resetSession,
  setLockState,
  vote,
} from './api'

type TerminalTone = 'success' | 'error' | 'info'

type CommandEntry = {
  id: string
  kind: 'command'
  prompt: string
  command: string
}

type OutputEntry = {
  id: string
  kind: 'output'
  lines: string[]
  tone: TerminalTone
}

type TerminalEntry = CommandEntry | OutputEntry

const PROMPT = 'dev@group-dinner-picker:~$'
const PROMPT_COLOR = 'text-emerald-400'

const MAN_PAGES: Record<string, string[]> = {
  help: [
    'NAME',
    '    help - display available commands',
    'SYNOPSIS',
    '    help',
    'DESCRIPTION',
    '    Lists every supported command with a short summary.',
    'SEE ALSO',
    '    man <command>',
  ],
  options: [
    'NAME',
    '    options - list active dinner ideas',
    'SYNOPSIS',
    '    options',
    'DESCRIPTION',
    '    Fetches each option with id, link, vote total, and short-id reference.',
    'NOTES',
    '    Use the printed id or short-id with vote and delete commands.',
  ],
  add: [
    'NAME',
    '    add - create a new dinner option',
    'SYNOPSIS',
    '    add "<name>" <link>',
    'DESCRIPTION',
    '    Persists a new option when a valid http/https link is provided.',
    'EXAMPLES',
    '    add "Taco Palace" https://example.com/menu',
  ],
  vote: [
    'NAME',
    '    vote - adjust the vote count for an option',
    'SYNOPSIS',
    '    vote <id> <+1|-1|up|down>',
    'DESCRIPTION',
    '    Increments or decrements the vote total for the specified option.',
    'EXAMPLES',
    '    vote 123e4567-e89b-12d3-a456-426614174000 +1',
    '    vote 123e4567-e89b-12d3-a456-426614174000 down',
  ],
  delete: [
    'NAME',
    '    delete - remove an option',
    'SYNOPSIS',
    '    delete <id>',
    'DESCRIPTION',
    '    Deletes the option identified by id. Action cannot be undone.',
  ],
  stats: [
    'NAME',
    '    stats - inspect aggregate metrics',
    'SYNOPSIS',
    '    stats',
    'DESCRIPTION',
    '    Shows total options, vote counts, averages, and the top option.',
  ],
  lock: [
    'NAME',
    '    lock - inspect or change voting lock state',
    'SYNOPSIS',
    '    lock status',
    '    lock on',
    '    lock off',
    'DESCRIPTION',
    '    status reports the current lock. on prevents new votes. off unlocks voting.',
  ],
  reset: [
    'NAME',
    '    reset - clear current session data',
    'SYNOPSIS',
    '    reset',
    'DESCRIPTION',
    '    Removes every option and unlocks voting. Use when starting a new poll.',
  ],
  health: [
    'NAME',
    '    health - check backend service status',
    'SYNOPSIS',
    '    health',
    'DESCRIPTION',
    '    Returns API status, version, and timestamp for diagnostics.',
  ],
  clear: [
    'NAME',
    '    clear - reset the terminal view',
    'SYNOPSIS',
    '    clear',
    'DESCRIPTION',
    '    Removes prior output from the terminal while keeping the session active.',
  ],
  man: [
    'NAME',
    '    man - show detailed manual text for a command',
    'SYNOPSIS',
    '    man <command>',
    'DESCRIPTION',
    '    Prints command purpose, usage, and examples when available.',
  ],
}

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

function toneClass(tone: TerminalTone) {
  switch (tone) {
    case 'success':
      return 'text-emerald-300'
    case 'error':
      return 'text-rose-400'
    case 'info':
    default:
      return 'text-sky-300'
  }
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

function formatOptions(options: Option[]): string[] {
  if (options.length === 0) {
    return ['No dinner options yet. Add one with: add "Taco Place" https://example.com']
  }

  const lines: string[] = ['#  Name & votes', '──────────────────────────────────────────────────────────────']

  options.forEach((option, index) => {
    const position = `${index + 1}`.padStart(2, '0')
    const votesLabel = option.votes > 0 ? `+${option.votes}` : `${option.votes}`
    const idShort = option.id.split('-')[0]
    lines.push(`${position}  ${option.name}  [votes: ${votesLabel}]`)
    lines.push(`    id: ${option.id}`)
    if (option.link) {
      lines.push(`    link: ${option.link}`)
    }
    lines.push(`    short-id: ${idShort}`)
  })

  return lines
}

function formatStats(stats: Awaited<ReturnType<typeof getStats>>): string[] {
  const lines = [
    `Total options: ${stats.totalOptions}`,
    `Total votes: ${stats.totalVotes}`,
    `Average votes per option: ${stats.averageVotes.toFixed(2)}`,
  ]

  if (stats.mostPopularOption) {
    lines.push('Most popular option:')
    lines.push(`  ${stats.mostPopularOption.name} (${stats.mostPopularOption.votes} votes)`)
    lines.push(`  id: ${stats.mostPopularOption.id}`)
  }

  return lines
}

function App() {
  const [history, setHistory] = useState<TerminalEntry[]>(() => createInitialEntries())
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const helpLines = useMemo(
    () => [
      'Available commands:',
      '  help                     Show this help menu',
      '  options                  List dinner options with ids and votes',
      '  add "name" <link>        Create a new option (link must start with http/https)',
      '  vote <id> <+1|-1>        Upvote or downvote an option by id',
      '  delete <id>              Remove an option by id',
      '  stats                    Show aggregate stats',
      '  lock status|on|off       Inspect or change voting lock state',
      '  reset                    Clear options and unlock voting',
      '  health                   Check backend health',
      '  man <command>            Show detailed manual text',
      '  clear                    Clear the terminal history',
    ],
    []
  )

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!isProcessing) {
      inputRef.current?.focus()
    }
  }, [isProcessing])

  useEffect(() => {
    const node = scrollRef.current
    if (node) {
      node.scrollTop = node.scrollHeight
    }
  }, [history])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error'
      setHistory((prev) => [
        ...prev,
        {
          id: buildId(),
          kind: 'output',
          tone: 'error',
          lines: [message],
        },
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  const executeCommand = async (value: string) => {
    let tokens: string[]
    try {
      tokens = tokenizeCommand(value)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to parse command'
      setHistory((prev) => [
        ...prev,
        {
          id: buildId(),
          kind: 'output',
          tone: 'error',
          lines: [message],
        },
      ])
      return
    }

    if (tokens.length === 0) {
      return
    }

    const [command, ...args] = tokens
    const normalized = command.toLowerCase()

    try {
      switch (normalized) {
        case 'help':
          setHistory((prev) => [
            ...prev,
            {
              id: buildId(),
              kind: 'output',
              tone: 'info',
              lines: helpLines,
            },
          ])
          break
        case 'options':
          await handleOptions()
          break
        case 'add':
          await handleAdd(args)
          break
        case 'vote':
          await handleVote(args)
          break
        case 'delete':
          await handleDelete(args)
          break
        case 'stats':
          await handleStats()
          break
        case 'lock':
          await handleLock(args)
          break
        case 'reset':
          await handleReset()
          break
        case 'health':
          await handleHealth()
          break
        case 'man':
          await handleMan(args)
          break
        case 'clear':
          setHistory(createInitialEntries())
          break
        default:
          setHistory((prev) => [
            ...prev,
            {
              id: buildId(),
              kind: 'output',
              tone: 'error',
              lines: [`Unknown command: ${command}. Type 'help' to see options.`],
            },
          ])
          break
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Command failed'
      setHistory((prev) => [
        ...prev,
        {
          id: buildId(),
          kind: 'output',
          tone: 'error',
          lines: [message],
        },
      ])
    }
  }

  const handleMan = async (args: string[]) => {
    if (args.length < 1) {
      throw new Error('Usage: man <command>')
    }

    const target = args[0].toLowerCase()
    const manual = MAN_PAGES[target]

    if (!manual) {
      setHistory((prev) => [
        ...prev,
        {
          id: buildId(),
          kind: 'output',
          tone: 'error',
          lines: [`No manual entry for '${target}'.`, 'Type help to list available commands.'],
        },
      ])
      return
    }

    setHistory((prev) => [
      ...prev,
      {
        id: buildId(),
        kind: 'output',
        tone: 'info',
        lines: manual,
      },
    ])
  }

  const handleOptions = async () => {
    const options = await getOptions()
    setHistory((prev) => [
      ...prev,
      {
        id: buildId(),
        kind: 'output',
        tone: 'success',
        lines: formatOptions(options),
      },
    ])
  }

  const handleAdd = async (args: string[]) => {
    if (args.length < 2) {
      throw new Error('Usage: add "name" <link>')
    }

    const [name, link] = args
    const option = await createOption(name, link)

    const lines = [
      `Added option: ${option.name}`,
      `id: ${option.id}`,
      `link: ${option.link}`,
    ]

    setHistory((prev) => [
      ...prev,
      {
        id: buildId(),
        kind: 'output',
        tone: 'success',
        lines,
      },
    ])
  }

  const handleVote = async (args: string[]) => {
    if (args.length < 2) {
      throw new Error('Usage: vote <id> <+1|-1>')
    }

    const [optionId, deltaRaw] = args
    const normalizedDelta = deltaRaw.trim().toLowerCase()
    const delta = normalizedDelta === '+1' || normalizedDelta === 'up' ? 1 : normalizedDelta === '-1' || normalizedDelta === 'down' ? -1 : NaN

    if (Number.isNaN(delta)) {
      throw new Error('Delta must be +1, -1, up, or down')
    }

    const updated = await vote(optionId, delta)
    const lines = [
      `Recorded vote ${delta > 0 ? '+1' : '-1'} for ${updated.name}.`,
      `New total votes: ${updated.votes}`,
    ]

    setHistory((prev) => [
      ...prev,
      {
        id: buildId(),
        kind: 'output',
        tone: 'success',
        lines,
      },
    ])
  }

  const handleDelete = async (args: string[]) => {
    if (args.length < 1) {
      throw new Error('Usage: delete <id>')
    }

    const [optionId] = args
    await deleteOption(optionId)

    setHistory((prev) => [
      ...prev,
      {
        id: buildId(),
        kind: 'output',
        tone: 'success',
        lines: [`Deleted option ${optionId}.`],
      },
    ])
  }

  const handleStats = async () => {
    const stats = await getStats()
    setHistory((prev) => [
      ...prev,
      {
        id: buildId(),
        kind: 'output',
        tone: 'info',
        lines: formatStats(stats),
      },
    ])
  }

  const handleLock = async (args: string[]) => {
    if (args.length === 0) {
      throw new Error('Usage: lock status|on|off')
    }

    const subcommand = args[0].toLowerCase()

    if (subcommand === 'status') {
      const state = await getLockState()
      const lines = state.locked
        ? [`Voting is LOCKED. Locked at: ${state.lockedAt ?? 'unknown'}`]
        : ['Voting is unlocked.']
      setHistory((prev) => [
        ...prev,
        {
          id: buildId(),
          kind: 'output',
          tone: 'info',
          lines,
        },
      ])
      return
    }

    if (subcommand !== 'on' && subcommand !== 'off') {
      throw new Error('Usage: lock status|on|off')
    }

    const nextLocked = subcommand === 'on'
    const state = await setLockState(nextLocked)

    const lines = nextLocked
      ? [`Voting locked at ${state.lockedAt ?? 'now'}. No new votes allowed.`]
      : ['Voting unlocked. Developers may continue voting.']

    setHistory((prev) => [
      ...prev,
      {
        id: buildId(),
        kind: 'output',
        tone: 'success',
        lines,
      },
    ])
  }

  const handleReset = async () => {
    await resetSession()
    setHistory((prev) => [
      ...prev,
      {
        id: buildId(),
        kind: 'output',
        tone: 'success',
        lines: ['Session reset. Options cleared and voting unlocked.'],
      },
    ])
  }

  const handleHealth = async () => {
    const health = await getHealth()
    setHistory((prev) => [
      ...prev,
      {
        id: buildId(),
        kind: 'output',
        tone: 'info',
        lines: [
          `Status: ${health.status}`,
          `Timestamp: ${health.timestamp}`,
          `Version: ${health.version}`,
        ],
      },
    ])
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-emerald-200 font-mono flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-black/80 border border-emerald-500/40 rounded-xl shadow-[0_0_45px_rgba(16,185,129,0.25)] overflow-hidden">
          <div className="px-4 py-3 border-b border-emerald-500/40 flex items-center justify-between bg-emerald-500/10">
            <span className="uppercase tracking-[0.3em] text-xs text-emerald-300">Group Dinner Picker</span>
            <span className="text-emerald-400 text-xs">terminal-ui</span>
          </div>
          <div
            className="h-[70vh] p-4 overflow-y-auto space-y-2 selection:bg-emerald-500/40"
            ref={scrollRef}
            onClick={() => inputRef.current?.focus()}
          >
            {history.map((entry) => {
              if (entry.kind === 'command') {
                return (
                  <div key={entry.id} className="flex gap-2">
                    <span className={PROMPT_COLOR}>{entry.prompt}</span>
                    <span className="text-emerald-100">{entry.command}</span>
                  </div>
                )
              }

              return (
                <pre key={entry.id} className={`whitespace-pre-wrap leading-relaxed ${toneClass(entry.tone)}`}>
                  {entry.lines.join('\n')}
                </pre>
              )
            })}

            <form className="flex gap-2 pt-2 border-t border-emerald-500/20 mt-4" onSubmit={handleSubmit}>
              <span className={PROMPT_COLOR}>{PROMPT}</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onKeyDown}
                aria-busy={isProcessing}
                className="flex-1 bg-transparent border-none outline-none text-emerald-100 placeholder:text-emerald-500/60 caret-emerald-400"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder={isProcessing ? 'Processing…' : 'Enter command'}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
