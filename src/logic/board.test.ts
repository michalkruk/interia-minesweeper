import { describe, expect, it } from "vitest";
import {
  chordCell,
  createBoard,
  normalizeMines,
  revealCell,
  toggleFlag,
  type Level,
} from "./board";

function level(
  partial: Partial<Level> & Pick<Level, "mines" | "width" | "height">,
): Level {
  return {
    id: partial.id ?? "test",
    name: partial.name ?? "Test",
    mineCount: partial.mineCount ?? partial.mines.length,
    ...partial,
  };
}

describe("normalizeMines", () => {
  it("drops duplicates and coordinates outside the board", () => {
    const mines = normalizeMines(
      level({
        width: 8,
        height: 8,
        mines: [
          [1, 1],
          [1, 1],
          [8, 3],
          [5, 5],
        ],
      }),
    );

    expect(mines).toEqual([
      [1, 1],
      [5, 5],
    ]);
  });
});

describe("revealCell cascade", () => {
  it("opens the whole empty neighbourhood recursively and skips flags", () => {
    const board = createBoard(
      level({
        width: 5,
        height: 5,
        mines: [[4, 4]],
      }),
    );

    const flagged = toggleFlag(board, 1);
    const revealed = revealCell(flagged, 0);

    expect(revealed.cells[1].revealed).toBe(false);
    expect(revealed.cells[1].flagged).toBe(true);
    expect(revealed.cells[0].revealed).toBe(true);
    expect(revealed.cells[2].revealed).toBe(true);
    expect(revealed.cells[5].revealed).toBe(true);
    expect(revealed.state).toBe("playing");
  });
});

describe("first safe reveal", () => {
  it("moves the opening mine to the lowest free index", () => {
    const board = createBoard(
      level({
        width: 3,
        height: 1,
        mines: [[0, 0]],
      }),
    );

    const next = revealCell(board, 0);

    expect(next.cells[0].mine).toBe(false);
    expect(next.cells[0].revealed).toBe(true);
    expect(next.cells[1].mine).toBe(true);
    expect(next.state).toBe("playing");
  });

  it("keeps the mine and loses when there is nowhere to move it", () => {
    const board = createBoard(
      level({
        width: 2,
        height: 1,
        mines: [
          [0, 0],
          [1, 0],
        ],
      }),
    );

    const next = revealCell(board, 0);

    expect(next.state).toBe("lost");
    expect(next.cells[0].mine).toBe(true);
    expect(next.cells[0].revealed).toBe(true);
  });
});

describe("win condition", () => {
  it("marks the board as won when every safe cell is open", () => {
    const board = createBoard(
      level({
        width: 2,
        height: 2,
        mines: [[1, 1]],
      }),
    );

    const afterFirst = revealCell(board, 0);
    const afterSecond = revealCell(afterFirst, 1);
    const won = revealCell(afterSecond, 2);

    expect(won.state).toBe("won");
    expect(
      won.cells.filter((cell) => !cell.mine).every((cell) => cell.revealed),
    ).toBe(true);
  });
});

describe("flags", () => {
  it("toggles a flag and blocks reveal on flagged cells", () => {
    const board = createBoard(
      level({
        width: 3,
        height: 3,
        mines: [[2, 2]],
      }),
    );

    const flagged = toggleFlag(board, 0);
    expect(flagged.cells[0].flagged).toBe(true);

    const stillClosed = revealCell(flagged, 0);
    expect(stillClosed.cells[0].revealed).toBe(false);

    const revealed = revealCell(board, 1);
    const ignored = toggleFlag(revealed, 1);
    expect(ignored.cells[1].flagged).toBe(false);
    expect(ignored).toBe(revealed);
  });
});

describe("chordCell", () => {
  it("opens remaining neighbours when flag count matches the number", () => {
    const board = createBoard(
      level({
        width: 2,
        height: 2,
        mines: [[1, 0]],
      }),
    );

    const opened = revealCell(board, 0);
    const flagged = toggleFlag(opened, 1);
    const chorded = chordCell(flagged, 0);

    expect(chorded.cells[2].revealed).toBe(true);
    expect(chorded.cells[3].revealed).toBe(true);
    expect(chorded.state).toBe("won");
  });
});
