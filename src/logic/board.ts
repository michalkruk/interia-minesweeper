export type Level = {
  id: string;
  name: string;
  width: number;
  height: number;
  mineCount: number;
  mines: [number, number][];
};

export type Cell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
};

export type Board = {
  width: number;
  height: number;
  cells: Cell[];
  state: "idle" | "playing" | "won" | "lost";
};

const NEIGHBOR_OFFSETS: [number, number][] = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

function indexToCoords(index: number, width: number): [number, number] {
  return [index % width, Math.floor(index / width)];
}

function coordsToIndex(x: number, y: number, width: number): number {
  return y * width + x;
}

function inBounds(
  x: number,
  y: number,
  width: number,
  height: number,
): boolean {
  return x >= 0 && y >= 0 && x < width && y < height;
}

function neighborIndexes(
  index: number,
  width: number,
  height: number,
): number[] {
  const [x, y] = indexToCoords(index, width);
  const result: number[] = [];
  for (const [dx, dy] of NEIGHBOR_OFFSETS) {
    const nx = x + dx;
    const ny = y + dy;
    if (inBounds(nx, ny, width, height))
      result.push(coordsToIndex(nx, ny, width));
  }
  return result;
}

function countAdjacent(
  cells: Cell[],
  index: number,
  width: number,
  height: number,
): number {
  let count = 0;
  for (const neighbor of neighborIndexes(index, width, height)) {
    if (cells[neighbor].mine) count += 1;
  }
  return count;
}

function recalculateAdjacent(
  cells: Cell[],
  width: number,
  height: number,
): void {
  for (let i = 0; i < cells.length; i += 1) {
    cells[i].adjacent = countAdjacent(cells, i, width, height);
  }
}

export function normalizeMines(level: Level): [number, number][] {
  const seen = new Set<string>();
  const mines: [number, number][] = [];
  for (const [x, y] of level.mines) {
    if (!inBounds(x, y, level.width, level.height)) continue;
    const key = `${x},${y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    mines.push([x, y]);
  }
  return mines;
}

export function createBoard(level: Level): Board {
  const width = level.width;
  const height = level.height;
  const size = width * height;
  const cells: Cell[] = Array.from({ length: size }, () => ({
    mine: false,
    revealed: false,
    flagged: false,
    adjacent: 0,
  }));
  for (const [x, y] of normalizeMines(level)) {
    cells[coordsToIndex(x, y, width)].mine = true;
  }
  recalculateAdjacent(cells, width, height);
  return { width, height, cells, state: "idle" };
}
