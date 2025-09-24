import type { Option } from '../../../api'
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
} from '../../../api'
import type { TerminalTone } from '../types'

type CommandHandler = (args: string[]) => Promise<void> | void

type CommandContext = {
  pushOutput: (tone: TerminalTone, lines: string[]) => void
  clearTerminal: () => void
}

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
  list: [
    'NAME',
    '    list - list active dinner ideas',
    'SYNOPSIS',
    '    list',
    'DESCRIPTION',
    '    Fetches each option with numeric id, link, and current vote total.',
    'NOTES',
    '    Use the numeric id with vote, delete, and random.',
  ],
  options: [
    'NAME',
    '    options - legacy alias for list',
    'SYNOPSIS',
    '    options',
    'DESCRIPTION',
    '    Delegates to list. Prefer list for clarity.',
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
    '    vote 3 +1',
    '    vote 8 down',
  ],
  delete: [
    'NAME',
    '    delete - remove an option',
    'SYNOPSIS',
    '    delete <id>',
    'DESCRIPTION',
    '    Deletes the option identified by numeric id. Action cannot be undone.',
  ],
  stats: [
    'NAME',
    '    stats - inspect aggregate metrics',
    'SYNOPSIS',
    '    stats',
    'DESCRIPTION',
    '    Shows total options, vote counts, averages, and the top option.',
  ],
  random: [
    'NAME',
    '    random - pick a random dinner option',
    'SYNOPSIS',
    '    random',
    'DESCRIPTION',
    '    Selects a random option from the current list and displays its details.',
    'NOTES',
    '    Ensures options exist before selecting; run list to review everything.',
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

const HELP_LINES = [
  'Available commands:',
  '  help                     Show this help menu',
  '  list                     List dinner options with ids and votes',
  '  random                   Pick a random dinner option',
  '  add "name" <link>        Create a new option (link must start with http/https)',
  '  vote <id> <+1|-1>        Upvote or downvote (use numeric id)',
  '  delete <id>              Remove an option by numeric id',
  '  stats                    Show aggregate stats',
  '  lock status|on|off       Inspect or change voting lock state',
  '  reset                    Clear options and unlock voting',
  '  health                   Check backend health',
  '  man <command>            Show detailed manual text',
  '  clear                    Clear the terminal history',
  '  options                  Legacy alias for list',
]

function formatOptions(options: Option[]): string[] {
  if (options.length === 0) {
    return ['No dinner options yet. Add one with: add "Taco Place" https://example.com']
  }

  const lines: string[] = ['#  id  name / votes', '──────────────────────────────────────────────────────────────']

  options.forEach((option, index) => {
    const position = `${index + 1}`.padStart(2, '0')
    const votesLabel = option.votes > 0 ? `+${option.votes}` : `${option.votes}`
    lines.push(`${position}  id:${option.id}  ${option.name}  [votes: ${votesLabel}]`)
    if (option.link) {
      lines.push(`    link: ${option.link}`)
    }
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

export function createCommandHandlers({ pushOutput, clearTerminal }: CommandContext) {
  const handleList: CommandHandler = async () => {
    const options = await getOptions()
    pushOutput('success', formatOptions(options))
  }

  const handleRandom: CommandHandler = async () => {
    const options = await getOptions()

    if (options.length === 0) {
      pushOutput('info', ['No options available. Add one first with: add "Name" <link>'])
      return
    }

    const selected = options[Math.floor(Math.random() * options.length)]
    const lines = [
      `Random pick: ${selected.name}`,
      `id: ${selected.id}`,
      `votes: ${selected.votes}`,
    ]
    if (selected.link) {
      lines.push(`link: ${selected.link}`)
    }

    pushOutput('success', lines)
  }

  const handleAdd: CommandHandler = async (args) => {
    if (args.length < 2) {
      throw new Error('Usage: add "name" <link>')
    }

    const [name, link] = args
    const option = await createOption(name, link)

    pushOutput('success', [`Added option: ${option.name}`, `id: ${option.id}`, `link: ${option.link}`])
  }

  const handleVote: CommandHandler = async (args) => {
    if (args.length < 2) {
      throw new Error('Usage: vote <id> <+1|-1>')
    }

    const [optionIdRaw, deltaRaw] = args
    const optionId = Number(optionIdRaw)
    if (!Number.isInteger(optionId) || optionId <= 0) {
      throw new Error('Option id must be a positive integer')
    }
    const normalizedDelta = deltaRaw.trim().toLowerCase()
    const delta = normalizedDelta === '+1' || normalizedDelta === 'up' ? 1 : normalizedDelta === '-1' || normalizedDelta === 'down' ? -1 : NaN

    if (Number.isNaN(delta)) {
      throw new Error('Delta must be +1, -1, up, or down')
    }

    const updated = await vote(optionId, delta)
    pushOutput('success', [`Recorded vote ${delta > 0 ? '+1' : '-1'} for ${updated.name}.`, `New total votes: ${updated.votes}`])
  }

  const handleDelete: CommandHandler = async (args) => {
    if (args.length < 1) {
      throw new Error('Usage: delete <id>')
    }

    const [optionIdRaw] = args
    const optionId = Number(optionIdRaw)
    if (!Number.isInteger(optionId) || optionId <= 0) {
      throw new Error('Option id must be a positive integer')
    }
    await deleteOption(optionId)

    pushOutput('success', [`Deleted option ${optionId}.`])
  }

  const handleStats: CommandHandler = async () => {
    const stats = await getStats()
    pushOutput('info', formatStats(stats))
  }

  const handleLock: CommandHandler = async (args) => {
    if (args.length === 0) {
      throw new Error('Usage: lock status|on|off')
    }

    const subcommand = args[0].toLowerCase()

    if (subcommand === 'status') {
      const state = await getLockState()
      const lines = state.locked ? [`Voting is LOCKED. Locked at: ${state.lockedAt ?? 'unknown'}`] : ['Voting is unlocked.']
      pushOutput('info', lines)
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

    pushOutput('success', lines)
  }

  const handleReset: CommandHandler = async () => {
    await resetSession()
    pushOutput('success', ['Session reset. Options cleared and voting unlocked.'])
  }

  const handleHealth: CommandHandler = async () => {
    const health = await getHealth()
    pushOutput('info', [`Status: ${health.status}`, `Timestamp: ${health.timestamp}`, `Version: ${health.version}`])
  }

  const handleMan: CommandHandler = (args) => {
    if (args.length === 0) {
      throw new Error('Usage: man <command>')
    }

    const target = args[0].toLowerCase()
    const manual = MAN_PAGES[target]
    if (!manual) {
      throw new Error(`No manual entry for ${target}`)
    }

    pushOutput('info', manual)
  }

  const handleHelp: CommandHandler = () => {
    pushOutput('info', HELP_LINES)
  }

  const handleClear: CommandHandler = () => {
    clearTerminal()
  }

  const handlers: Record<string, CommandHandler> = {
    help: handleHelp,
    list: handleList,
    ls: handleList,
    options: handleList,
    add: handleAdd,
    vote: handleVote,
    delete: handleDelete,
    stats: handleStats,
    random: handleRandom,
    lock: handleLock,
    reset: handleReset,
    health: handleHealth,
    man: handleMan,
    clear: handleClear,
  }

  return {
    async run(command: string, args: string[]) {
      const handler = handlers[command]
      if (!handler) {
        return false
      }

      await handler(args)
      return true
    },
  }
}

export { HELP_LINES, MAN_PAGES }
