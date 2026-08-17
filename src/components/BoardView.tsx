import type { Board } from '../logic/board'
import { Cell } from './Cell'

type BoardViewProps = {
  board: Board
  onReveal: (index: number) => void
  onFlag: (index: number) => void
  onChord: (index: number) => void
}

export function BoardView({ board, onReveal, onFlag, onChord }: BoardViewProps) {
  return (
    <div
      className="game__board"
      style={{ gridTemplateColumns: `repeat(${board.width}, var(--size-cell))` }}
      role="grid"
      aria-label="Minesweeper board"
    >
      {board.cells.map((cell, index) => (
        <Cell
          key={index}
          cell={cell}
          index={index}
          onReveal={onReveal}
          onFlag={onFlag}
          onChord={onChord}
        />
      ))}
    </div>
  )
}
