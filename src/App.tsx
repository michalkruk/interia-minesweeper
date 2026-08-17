import { useMemo, useState } from "react";
import { levels } from "./data/levels";
import {
  chordCell,
  createBoard,
  remainingMines,
  revealCell,
  toggleFlag,
  type Board,
  type Level,
} from "./logic/board";
import { BoardView } from "./components/BoardView";
import "./App.scss";

function statusLabel(state: Board["state"]): string {
  switch (state) {
    case "idle":
      return "Gotowy";
    case "playing":
      return "W grze";
    case "won":
      return "Wygrana";
    case "lost":
      return "Przegrana";
  }
}

function App() {
  const [selectedId, setSelectedId] = useState(levels[0]?.id ?? "");
  const selectedLevel = useMemo<Level | undefined>(
    () => levels.find((level) => level.id === selectedId) ?? levels[0],
    [selectedId],
  );
  const [board, setBoard] = useState<Board>(() => createBoard(levels[0]));

  const restart = (level: Level) => {
    setBoard(createBoard(level));
  };

  const handleLevelChange = (levelId: string) => {
    const level = levels.find((item) => item.id === levelId);
    if (!level) {
      return;
    }

    setSelectedId(level.id);
    restart(level);
  };

  if (!selectedLevel) {
    return <p>Brak plansz do wczytania.</p>;
  }

  return (
    <main className="game">
      <header className="game__header">
        <h1 className="game__title">Saper</h1>
      </header>

      <div className="game__toolbar">
        <label className="game__label" htmlFor="level-select">
          Plansza
        </label>
        <select
          id="level-select"
          className="game__select"
          value={selectedLevel.id}
          onChange={(event) => handleLevelChange(event.target.value)}
        >
          {levels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="game__button"
          onClick={() => restart(selectedLevel)}
        >
          Restart
        </button>
      </div>

      <div className="game__status">
        <span className="game__counter" aria-label="Remaining mines">
          {String(remainingMines(board)).padStart(3, "0")}
        </span>
        <span className={`game__state game__state--${board.state}`}>
          {statusLabel(board.state)}
        </span>
      </div>

      <BoardView
        board={board}
        onReveal={(index) => setBoard((current) => revealCell(current, index))}
        onFlag={(index) => setBoard((current) => toggleFlag(current, index))}
        onChord={(index) => setBoard((current) => chordCell(current, index))}
      />

      <p className="game__hint">
        LPM - odkryj / chord na otwartym polu z cyfrą. PPM - flaga.
      </p>
    </main>
  );
}

export default App;
