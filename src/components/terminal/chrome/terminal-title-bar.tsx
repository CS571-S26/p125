'use client'

import { useGame } from '@/contexts/game-context'
import { TitleBar } from './title-bar'

export function TerminalTitleBar() {
  const { activeGame, exitGame, liveScore } = useGame()

  if (activeGame) {
    return (
      <TitleBar
        title={<span className="font-pixel text-[7px] pt-0.5 uppercase tracking-widest">games — {activeGame}</span>}
        rightContent={<span className="font-pixel text-[8px] text-game-accent">score: {liveScore ?? 0}</span>}
        redAction={{ onClick: exitGame, ariaLabel: 'Exit game' }}
      />
    )
  }

  return (
    <TitleBar title="bash — visitor@vishrut.tech" />
  )
}
