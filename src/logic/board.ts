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

function cloneCells(cells: Cell[]): Cell[] {
  return cells.map((cell) => ({ ...cell }));
}

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
    if (inBounds(nx, ny, width, height)) {
      result.push(coordsToIndex(nx, ny, width));
    }
  }

  return result;
}

export function normalizeMines(level: Level): [number, number][] {
  const seen = new Set<string>();
  const mines: [number, number][] = [];

  for (const [x, y] of level.mines) {
    if (!inBounds(x, y, level.width, level.height)) {
      continue;
    }

    const key = `${x},${y}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    mines.push([x, y]);
  }

  return mines;
}

function countAdjacent(
  cells: Cell[],
  index: number,
  width: number,
  height: number,
): number {
  let count = 0;
  for (const neighbor of neighborIndexes(index, width, height)) {
    if (cells[neighbor].mine) {
      count += 1;
    }
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

function isWon(cells: Cell[]): boolean {
  return cells.every((cell) => cell.mine || cell.revealed);
}

function revealAllMines(cells: Cell[]): void {
  for (const cell of cells) {
    if (cell.mine) {
      cell.revealed = true;
      cell.flagged = false;
    }
  }
}

function moveMineAwayFrom(
  cells: Cell[],
  fromIndex: number,
  width: number,
  height: number,
): boolean {
  cells[fromIndex].mine = false;

  for (let i = 0; i < cells.length; i += 1) {
    if (i === fromIndex || cells[i].mine) {
      continue;
    }

    cells[i].mine = true;
    recalculateAdjacent(cells, width, height);
    return true;
  }

  cells[fromIndex].mine = true;
  return false;
}

function floodReveal(
  cells: Cell[],
  startIndex: number,
  width: number,
  height: number,
): void {
  const stack = [startIndex];

  while (stack.length > 0) {
    const index = stack.pop();
    if (index === undefined) {
      break;
    }

    const cell = cells[index];
    if (cell.revealed || cell.flagged || cell.mine) {
      continue;
    }

    cell.revealed = true;

    if (cell.adjacent !== 0) {
      continue;
    }

    for (const neighbor of neighborIndexes(index, width, height)) {
      const next = cells[neighbor];
      if (!next.revealed && !next.flagged && !next.mine) {
        stack.push(neighbor);
      }
    }
  }
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

  return {
    width,
    height,
    cells,
    state: "idle",
  };
}

export function revealCell(board: Board, index: number): Board {
  if (board.state === "won" || board.state === "lost") {
    return board;
  }

  if (index < 0 || index >= board.cells.length) {
    return board;
  }

  const target = board.cells[index];
  if (target.revealed || target.flagged) {
    return board;
  }

  const cells = cloneCells(board.cells);
  let state = board.state;

  if (state === "idle") {
    if (cells[index].mine) {
      moveMineAwayFrom(cells, index, board.width, board.height);
    }
    state = "playing";
  }

  if (cells[index].mine) {
    revealAllMines(cells);
    return {
      ...board,
      cells,
      state: "lost",
    };
  }

  floodReveal(cells, index, board.width, board.height);

  return {
    ...board,
    cells,
    state: isWon(cells) ? "won" : state,
  };
}

export function toggleFlag(board: Board, index: number): Board {
  if (board.state === "won" || board.state === "lost") {
    return board;
  }

  if (index < 0 || index >= board.cells.length) {
    return board;
  }

  const target = board.cells[index];
  if (target.revealed) {
    return board;
  }

  const cells = cloneCells(board.cells);
  cells[index].flagged = !cells[index].flagged;

  return {
    ...board,
    cells,
  };
}

export function chordCell(board: Board, index: number): Board {
  if (board.state === "won" || board.state === "lost") {
    return board;
  }

  if (index < 0 || index >= board.cells.length) {
    return board;
  }

  const cell = board.cells[index];
  if (!cell.revealed || cell.adjacent === 0) {
    return board;
  }

  const neighbors = neighborIndexes(index, board.width, board.height);
  const flagCount = neighbors.reduce(
    (count, neighborIndex) =>
      count + (board.cells[neighborIndex].flagged ? 1 : 0),
    0,
  );

  if (flagCount !== cell.adjacent) {
    return board;
  }

  let next = board;
  for (const neighborIndex of neighbors) {
    const neighbor = next.cells[neighborIndex];
    if (!neighbor.revealed && !neighbor.flagged) {
      next = revealCell(next, neighborIndex);
      if (next.state === "lost" || next.state === "won") {
        return next;
      }
    }
  }

  return next;
}

export function remainingMines(board: Board): number {
  const mines = board.cells.reduce(
    (count, cell) => count + (cell.mine ? 1 : 0),
    0,
  );
  const flags = board.cells.reduce(
    (count, cell) => count + (cell.flagged ? 1 : 0),
    0,
  );
  return mines - flags;
}
