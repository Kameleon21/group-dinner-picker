import { useEffect, useRef } from 'react'
import TerminalView from './features/terminal/components/TerminalView'
import { PROMPT, PROMPT_COLOR, useTerminalSession } from './features/terminal/useTerminalSession'

function App() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

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

  const handleViewportClick = () => {
    inputRef.current?.focus()
  }

  return (
    <TerminalView
      history={history}
      prompt={PROMPT}
      promptColor={PROMPT_COLOR}
      inputValue={input}
      isProcessing={isProcessing}
      onSubmit={handleSubmit}
      onInputChange={handleInputChange}
      onKeyDown={handleKeyDown}
      inputRef={inputRef}
      scrollRef={scrollRef}
      onViewportClick={handleViewportClick}
    />
  )
}

export default App
