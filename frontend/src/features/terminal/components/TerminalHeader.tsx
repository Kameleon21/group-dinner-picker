import type { FC } from 'react'

type TerminalHeaderProps = {
  title: string
  badge: string
}

const TerminalHeader: FC<TerminalHeaderProps> = ({ title, badge }) => {
  return (
    <div className="px-4 py-3 border-b border-emerald-500/40 flex items-center justify-between bg-emerald-500/10">
      <span className="uppercase tracking-[0.3em] text-xs text-emerald-300">{title}</span>
      <span className="text-emerald-400 text-xs">{badge}</span>
    </div>
  )
}

export default TerminalHeader
