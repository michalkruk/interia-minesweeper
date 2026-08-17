import type { Cell as CellModel } from '../logic/board'

type CellProps = {
  cell: CellModel
  index: number
  onReveal: (index: number) => void
  onFlag: (index: number) => void
  onChord: (index: number) => void
}

function cellContent(cell: CellModel): string {
  if (cell.flagged) {
    return '⚑'
  }

  if (!cell.revealed) {
    return ''
  }

  if (cell.mine) {
    return '●'
  }

  if (cell.adjacent > 0) {
    return String(cell.adjacent)
  }

  return ''
}

export function Cell({ cell, index, onReveal, onFlag, onChord }: CellProps) {
  const classNames = ['cell']

  if (cell.revealed) {
    classNames.push('cell--revealed')
  }

  if (cell.flagged) {
    classNames.push('cell--flagged')
  }

  if (cell.revealed && cell.mine) {
    classNames.push('cell--mine')
  }

  if (cell.revealed && !cell.mine && cell.adjacent > 0) {
    classNames.push(`cell--number-${cell.adjacent}`)
  }

  return (
    <button
      type="button"
      className={classNames.join(' ')}
      aria-label={`Cell ${index}`}
      onClick={() => {
        if (cell.revealed) {
          onChord(index)
          return
        }
        onReveal(index)
      }}
      onContextMenu={(event) => {
        event.preventDefault()
        onFlag(index)
      }}
    >
      {cellContent(cell)}
    </button>
  )
}
