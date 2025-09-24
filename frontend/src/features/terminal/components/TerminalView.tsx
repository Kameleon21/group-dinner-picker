import type { FC, FormEvent, KeyboardEvent, MutableRefObject } from 'react'
import type { TerminalEntry } from '../types'
import TerminalHeader from './TerminalHeader'
import TerminalHistory from './TerminalHistory'
import TerminalPromptForm from './TerminalPromptForm'

type TerminalViewProps = {
  history: TerminalEntry[]
  prompt: string
  promptColor: string
  inputValue: string
  isProcessing: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onInputChange: (value: string) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  inputRef: MutableRefObject<HTMLInputElement | null>
  scrollRef: MutableRefObject<HTMLDivElement | null>
  onViewportClick: () => void
}

const TerminalView: FC<TerminalViewProps> = ({
  history,
  prompt,
  promptColor,
  inputValue,
  isProcessing,
  onSubmit,
  onInputChange,
  onKeyDown,
  inputRef,
  scrollRef,
  onViewportClick,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-emerald-200 font-mono flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-black/80 border border-emerald-500/40 rounded-xl shadow-[0_0_45px_rgba(16,185,129,0.25)] overflow-hidden">
          <TerminalHeader title="Group Dinner Picker" badge="terminal-ui" />
          <div
            className="h-[70vh] p-4 overflow-y-auto space-y-2 selection:bg-emerald-500/40"
            ref={scrollRef}
            onClick={onViewportClick}
          >
            <TerminalHistory entries={history} promptColor={promptColor} />

            <TerminalPromptForm
              prompt={prompt}
              promptColor={promptColor}
              inputValue={inputValue}
              isProcessing={isProcessing}
              onSubmit={onSubmit}
              onInputChange={onInputChange}
              onKeyDown={onKeyDown}
              inputRef={inputRef}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TerminalView
