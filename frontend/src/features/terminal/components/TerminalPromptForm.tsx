import type { FC, FormEvent, KeyboardEvent, MutableRefObject } from 'react'

export type TerminalPromptFormProps = {
  prompt: string
  promptColor: string
  inputValue: string
  isProcessing: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onInputChange: (value: string) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  inputRef: MutableRefObject<HTMLInputElement | null>
}

const TerminalPromptForm: FC<TerminalPromptFormProps> = ({
  prompt,
  promptColor,
  inputValue,
  isProcessing,
  onSubmit,
  onInputChange,
  onKeyDown,
  inputRef,
}) => {
  return (
    <form className="flex gap-2 pt-2 border-t border-emerald-500/20 mt-4" onSubmit={onSubmit}>
      <span className={promptColor}>{prompt}</span>
      <input
        ref={inputRef}
        value={inputValue}
        onChange={(event) => onInputChange(event.target.value)}
        onKeyDown={onKeyDown}
        aria-busy={isProcessing}
        className="flex-1 bg-transparent border-none outline-none text-emerald-100 placeholder:text-emerald-500/60 caret-emerald-400"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder={isProcessing ? 'Processing…' : 'Enter command'}
      />
    </form>
  )
}

export default TerminalPromptForm
