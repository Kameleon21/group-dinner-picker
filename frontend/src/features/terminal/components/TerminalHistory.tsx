import type { FC } from 'react'
import type { TerminalEntry, TerminalTone } from '../types'

const toneClass = (tone: TerminalTone) => {
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

type TerminalHistoryProps = {
  entries: TerminalEntry[]
  promptColor: string
}

const TerminalHistory: FC<TerminalHistoryProps> = ({ entries, promptColor }) => {
  return (
    <>
      {entries.map((entry) => {
        if (entry.kind === 'command') {
          return (
            <div key={entry.id} className="flex gap-2">
              <span className={promptColor}>{entry.prompt}</span>
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
    </>
  )
}

export default TerminalHistory
