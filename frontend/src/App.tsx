import { useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import {
  PROMPT,
  PROMPT_COLOR,
  useTerminalSession,
} from './features/terminal/useTerminalSession'
import type { TerminalTone } from './features/terminal/useTerminalSession'

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

function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { history, input, isProcessing, handleSubmit, handleKeyDown, handleInputChange } =
    useTerminalSession({
      onClear: () => requestAnimationFrame(() => inputRef.current?.focus()),
    })

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

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    handleKeyDown(event)
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
                onChange={(event) => handleInputChange(event.target.value)}
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
