import type { Level } from '../logic/board'
import levelsData from './saper-plansze.json'

function parseLevel(raw: (typeof levelsData.levels)[number]): Level {
  const mines: [number, number][] = []

  for (const pair of raw.mines) {
    const x = pair[0]
    const y = pair[1]
    if (typeof x === 'number' && typeof y === 'number') {
      mines.push([x, y])
    }
  }

  return {
    id: raw.id,
    name: raw.name,
    width: raw.width,
    height: raw.height,
    mineCount: raw.mineCount,
    mines,
  }
}

export const levels: Level[] = levelsData.levels.map(parseLevel)
