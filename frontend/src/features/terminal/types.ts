export type TerminalTone = 'success' | 'error' | 'info'

export type CommandEntry = {
  id: string
  kind: 'command'
  prompt: string
  command: string
}

export type OutputEntry = {
  id: string
  kind: 'output'
  lines: string[]
  tone: TerminalTone
}

export type TerminalEntry = CommandEntry | OutputEntry
