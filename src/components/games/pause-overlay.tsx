'use client'

import { useGame } from '@/contexts/game-context'

export function PauseOverlay() {
  const { isMuted, toggleMute, activeConfig, setIsPaused } = useGame()
  const controls = activeConfig?.controls ?? []

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-(family-name:--font-jetbrains-mono)">
      <div className="bg-background/90 border border-border rounded-lg p-6 min-w-[220px] space-y-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Paused</p>
        <button
          onClick={toggleMute}
          className="w-full text-left text-sm flex justify-between items-center"
        >
          <span>Sound</span>
          <span>{isMuted ? 'OFF' : 'ON'}</span>
        </button>
        {controls.length > 0 && (
          <div className="border-t border-border pt-3 text-xs text-muted-foreground space-y-1">
            {controls.map(c => <p key={c}>{c}</p>)}
          </div>
        )}
        <button
          onClick={() => setIsPaused(false)}
          className="w-full text-sm text-center pt-1"
        >
          Resume <span className="text-muted-foreground">(Esc)</span>
        </button>
      </div>
    </div>
  )
}
