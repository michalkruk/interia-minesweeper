# Saper - zadanie rekrutacyjne

Prosta implementacja sapera na React + TypeScript. Plansze biorę z `src/data/saper-plansze.json`, a cała logika gry siedzi w `src/logic/board.ts` bez Reacta.

## 1. Jak uruchomić

```bash
npm install
npm run dev
```

Build i testy:

```bash
npm run build
npm test
```

Sprawdzone na czystym `npm install` + powyższych komendach.

## 2. Co zrobiłem, a czego nie

Zrobione:

- kontrakt `createBoard` / `revealCell` / `toggleFlag` (+ `chordCell` i `remainingMines` jako helpery),
- pierwsze bezpieczne odkrycie, kaskada, flagi, win/lose,
- chording na odkrytym polu z cyfrą,
- wybór planszy, restart, licznik min, stany gry, podgląd min po przegranej,
- SCSS + BEM + zmienne CSS w jednym pliku,
- testy jednostkowe logiki.

Czego świadomie nie robiłem:

- timera / animacje - poza zakresem,
- osobnej warstwy walidacji JSON, normalizacja jest w `normalizeMines` i wystarcza na załączone dane,
- dopracowanie UI

## 3. Co znalazłem w danych

Plik ma kilka pułapek:

| Plansza             | Problem                             | Obsługa                                                                            |
| ------------------- | ----------------------------------- | ---------------------------------------------------------------------------------- |
| Pomyłka rachmistrza | `mineCount: 10`, a w tablicy 12 min | ignoruję `mineCount` przy budowie planszy; licznik UI bierze faktyczne `cell.mine` |
| Bliźnięta           | zduplikowane `[2, 2]`               | `normalizeMines` deduplikuje po `x,y`                                              |
| Za płotem           | mina `[8, 3]` poza `width: 8`       | odrzucam współrzędne out-of-bounds                                                 |
| Łąka                | 0 min                               | działa; pierwsze kliknięcie odkrywa całą planszę i wygrywa                         |
| Ciasno              | same miny                           | pierwsze kliknięcie nie ma gdzie przenieść miny → przegrana zgodnie z regułą       |

Dzięki temu gra nie wywala się na żadnym poziomie z listy.

## 4. Co było najtrudniejsze

Najwięcej uwagi zjadło pierwsze bezpieczne odkrycie + przeliczenie `adjacent` po przeniesieniu miny. Łatwo było zepsuć immutability (mutacja tablicy bez klona) albo zostawić stare wartości `adjacent`. Ostatecznie: zawsze `cloneCells`, a po relokacji pełne `recalculateAdjacent`.

Drugie miejsce: nie ufać `mineCount` z JSON. Dopiero po przejściu pliku poziom po poziomie było widać, że licznik musi iść z faktycznego stanu komórek.

## 5. Biblioteki

- **React** - UI, wymaganie briefu
- **Vite** - szybki setup pod React+TS
- **TypeScript (strict)** - wymaganie briefu
- **Sass** - wymagane SCSS
- **Vitest** - lekkie testy jednostkowe logiki, ten sam runner co Vite

Poza tym nic, bez UI kitów i CSS-in-JS.

## 6. Co zrobiłbym dalej (gdyby to szło na produkcję)

- osobny parser/walidator levels z jasnymi warningami w UI (nie tylko ciche filtrowanie),
- `useReducer` zamiast kilku setterów, gdyby doszła funkcjonalność undo / replay,
- więcej testów
- zagadnienia z dostępności, czyli, np. nawigacja klawiaturą po siatce, lepsze aria-label z pozycją

## 7. Gdzie korzystałem z AI

Korzystałem z AI oraz Cursora głównie jako narzędzi pomocniczych do szybkiego przypomnienia składni i konfiguracji Vite + Vitest, analizy danych wejściowych oraz sprawdzenia możliwych przypadków brzegowych. Korzystałem z nich również przy konsultowaniu niektórych rozwiązań i porządkowaniu kodu. Implementację weryfikowałem samodzielnie, uruchamiając aplikację lokalnie, testy oraz sprawdzając poziomy z załączonego pliku. Ostateczne decyzje dotyczące struktury, logiki gry i wyglądu interfejsu podejmowałem sam
