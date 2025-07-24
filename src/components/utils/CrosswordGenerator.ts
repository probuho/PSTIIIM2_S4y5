// Tipos para el crucigrama
export type WordEntry = {
  word: string;
  hint: string;
};

//Celda del Grid
export type GridCell = {
  char: string;       // Letra actual
  isOccupied: boolean; // True de existir una letra en la celda
  clueNumber?: number; // Numero mostrado de las pistas
  occupyingWordIds: Set<string>; // Id de las palabras ocupando una celda
};

//Grid interno 
export type InternalGrid = GridCell[][];

// Tipo de celda acorde a la librería
type ReactCrosswordGridCell = {
  char?: string;
  number?: number;
} | null;

//Interfaz de los datos del crucigrama
export interface CrosswordData {
  across: { [key: number]: { clue: string; answer: string } };
  down: { [key: number]: { clue: string; answer: string } };
  grid: ReactCrosswordGridCell[][];
}

// Tipo de las palabras correctamente generadas
export type PlacedWord = {
  word: string;
  hint: string;
  startRow: number;
  startCol: number;
  direction: 'across' | 'down';
  clueNumber: number;
  id: string;
  answer: string;
};

// Tipo del resultado del generador
export type GeneratorResult = {
  crosswordData: CrosswordData;
  placedWords: PlacedWord[];
};

//Generador del crucigrama
class CrosswordGenerator {
  private wordsToPlace: WordEntry[];
  private gridSize: number;
  private currentGrid: InternalGrid;
  private placedWords: PlacedWord[];
  private solutionFound: boolean;
  private nextClueNumber: number;

  //Construcción del crucigrama
  constructor(words: WordEntry[], size: number = 15) {
    this.wordsToPlace = [...words].sort((a, b) => b.word.length - a.word.length);
    this.gridSize = size;
    this.solutionFound = false;
    this.placedWords = [];
    this.nextClueNumber = 1;
    this.initializeGrid();
  }

  //Construcción del grid
  private initializeGrid() {
    this.currentGrid = Array(this.gridSize).fill(null).map(() =>
      Array(this.gridSize).fill(null).map(() => ({
        char: '',
        isOccupied: false,
        occupyingWordIds: new Set(),
        clueNumber: undefined,
      }))
    );
  }

  //Generación del crucigrama con el grid ya generado y el posicionamente de palabras dentro de este
  public generate(): GeneratorResult | null {
    this.initializeGrid();
    this.placedWords = [];
    this.solutionFound = false;
    this.nextClueNumber = 1;

    if (this.wordsToPlace.length === 0) return null;

    const firstWordEntry = this.wordsToPlace[0];
    const firstWord = firstWordEntry.word.toUpperCase();
    const midRow = Math.floor(this.gridSize / 2);
    const midCol = Math.floor(this.gridSize / 2);

    const initialPlacements = [
      { r: midRow, c: Math.max(0, midCol - Math.floor(firstWord.length / 2)), direction: 'across' as 'across' | 'down' },
      { r: Math.max(0, midRow - Math.floor(firstWord.length / 2)), c: midCol, direction: 'down' as 'across' | 'down' }
    ];

    initialPlacements.sort(() => 0.5 - Math.random());

    for (const { r, c, direction } of initialPlacements) {
        if ((direction === 'across' && c + firstWord.length > this.gridSize) ||
            (direction === 'down' && r + firstWord.length > this.gridSize)) {
            continue;
        }

        const initialClueNumber = this.nextClueNumber;
        this.placeWord(firstWordEntry, r, c, direction, initialClueNumber);
        this.nextClueNumber++;

        if (this.tryPlaceWord(1)) {
            this.solutionFound = true;
            // console.log("Generator's internal grid before return:", this.currentGrid); // Debugging
            return {
                crosswordData: this.formatForReactCrossword(),
                placedWords: this.placedWords,
            };
        }

        this.nextClueNumber--;
        this.removeWord(firstWordEntry, r, c, direction, initialClueNumber);
        this.initializeGrid();
        this.placedWords = [];
    }

    return null;
  }

  //Calculo de potenciales combinaciones de palabras y su posicionamiento
  private tryPlaceWord(wordIndex: number): boolean {
    if (wordIndex === this.wordsToPlace.length) {
      return true;
    }

    const wordEntry = this.wordsToPlace[wordIndex];
    const word = wordEntry.word.toUpperCase();

    const potentialPlacements: { r: number, c: number, direction: 'across' | 'down', type: 'intersection' | 'empty' }[] = [];

    this.placedWords.forEach(pWord => {
      for (let i = 0; i < pWord.word.length; i++) {
        const pR = pWord.direction === 'across' ? pWord.startRow : pWord.startRow + i;
        const pC = pWord.direction === 'across' ? pWord.startCol + i : pWord.startCol;

        for (let j = 0; j < word.length; j++) {
          if (word[j] === pWord.word.toUpperCase()[i]) {
            let newR: number, newC: number, newDirection: 'across' | 'down';

            if (pWord.direction === 'across') {
              newR = pR - j;
              newC = pC;
              newDirection = 'down';
            } else {
              newR = pR;
              newC = pC - j;
              newDirection = 'across';
            }
            if (newR >= 0 && newR < this.gridSize && newC >= 0 && newC < this.gridSize) {
                if (this.canPlaceWord(word, newR, newC, newDirection)) {
                    potentialPlacements.push({ r: newR, c: newC, direction: newDirection, type: 'intersection' });
                }
            }
          }
        }
      }
    });

    if (this.placedWords.length < 2 || potentialPlacements.length === 0) {
      for (let r = 0; r < this.gridSize; r++) {
        for (let c = 0; c < this.gridSize; c++) {
          if (this.canPlaceWord(word, r, c, 'across')) {
            if (!potentialPlacements.some(p => p.r === r && p.c === c && p.direction === 'across')) {
                potentialPlacements.push({ r, c, direction: 'across', type: 'empty' });
            }
          }
          if (this.canPlaceWord(word, r, c, 'down')) {
            if (!potentialPlacements.some(p => p.r === r && p.c === c && p.direction === 'down')) {
                potentialPlacements.push({ r, c, direction: 'down', type: 'empty' });
            }
          }
        }
      }
    }

    potentialPlacements.sort((a, b) => {
        if (a.type === 'intersection' && b.type === 'empty') return -1;
        if (a.type === 'empty' && b.type === 'intersection') return 1;
        return 0.5 - Math.random();
    });

    for (const { r, c, direction } of potentialPlacements) {
      if (this.canPlaceWord(word, r, c, direction)) {
        const currentClueNumber = this.nextClueNumber;
        this.placeWord(wordEntry, r, c, direction, currentClueNumber);
        this.nextClueNumber++;

        if (this.tryPlaceWord(wordIndex + 1)) {
          return true;
        }

        this.nextClueNumber--;
        this.removeWord(wordEntry, r, c, direction, currentClueNumber);
      }
    }

    return false;
  }

  //Posicionamiento de palabras en los posibles espacios dependiendo de la combinación de palabras
  private canPlaceWord(word: string, startRow: number, startCol: number, direction: 'across' | 'down'): boolean {
    const len = word.length;
    let intersections = 0;
    let newCellsOccupied = 0;

    if (direction === 'across') {
      if (startCol < 0 || startCol + len > this.gridSize || startRow < 0 || startRow >= this.gridSize) return false;
    } else {
      if (startRow < 0 || startRow + len > this.gridSize || startCol < 0 || startCol >= this.gridSize) return false;
    }

    for (let i = 0; i < len; i++) {
      const r = direction === 'across' ? startRow : startRow + i;
      const c = direction === 'across' ? startCol + i : startCol;

      const currentCell = this.currentGrid[r][c];

      if (currentCell.isOccupied) {
        if (currentCell.char !== word[i]) {
          return false;
        }
        intersections++;
      } else {
        newCellsOccupied++;

        if (i === 0) {
            const prevR = direction === 'across' ? r : r - 1;
            const prevC = direction === 'across' ? c - 1 : c;
            if (prevR >= 0 && prevR < this.gridSize && prevC >= 0 && prevC < this.gridSize) {
                if (this.currentGrid[prevR][prevC].isOccupied) {
                    return false;
                }
            }
        }
        if (i === len - 1) {
            const nextR = direction === 'across' ? r : r + 1;
            const nextC = direction === 'across' ? c + 1 : c;
            if (nextR >= 0 && nextR < this.gridSize && nextC >= 0 && nextC < this.gridSize) {
                if (this.currentGrid[nextR][nextC].isOccupied) {
                    return false;
                }
            }
        }

        if (direction === 'across') {
          if (r > 0 && this.currentGrid[r - 1][c].isOccupied) return false;
          if (r + 1 < this.gridSize && this.currentGrid[r + 1][c].isOccupied) return false;
        } else {
          if (c > 0 && this.currentGrid[r][c - 1].isOccupied) return false;
          if (c + 1 < this.gridSize && this.currentGrid[r][c + 1].isOccupied) return false;
        }
      }
    }

    if (this.placedWords.length > 0 && (intersections === 0 || newCellsOccupied === 0)) {
        return false;
    }

    return true;
  }

  //Posicionamiento de las celdas de las palabras basado en las palabras utilizadas
  private placeWord(wordEntry: WordEntry, startRow: number, startCol: number, direction: 'across' | 'down', clueNumber: number) {
    const word = wordEntry.word.toUpperCase();
    const wordId = `${clueNumber}-${direction}`;

    for (let i = 0; i < word.length; i++) {
      const r = direction === 'across' ? startRow : startRow + i;
      const c = direction === 'across' ? startCol + i : startCol;
      this.currentGrid[r][c].char = word[i];
      this.currentGrid[r][c].isOccupied = true;
      this.currentGrid[r][c].occupyingWordIds.add(wordId);
    }
    this.currentGrid[startRow][startCol].clueNumber = clueNumber;

    this.placedWords.push({
      word: wordEntry.word,
      hint: wordEntry.hint,
      startRow,
      startCol,
      direction,
      clueNumber,
      id: wordId,
      answer: wordEntry.word.toUpperCase(),
    });
  }

  //Proceso para la eliminación de letras
  private removeWord(wordEntry: WordEntry, startRow: number, startCol: number, direction: 'across' | 'down', clueNumber: number) {
    const word = wordEntry.word.toUpperCase();
    const wordIdToRemove = `${clueNumber}-${direction}`;

    for (let i = 0; i < word.length; i++) {
      const r = direction === 'across' ? startRow : startRow + i;
      const c = direction === 'across' ? startCol + i : startCol;

      const cell = this.currentGrid[r][c];
      cell.occupyingWordIds.delete(wordIdToRemove);

      if (cell.occupyingWordIds.size === 0) {
        cell.char = '';
        cell.isOccupied = false;
        if (r === startRow && c === startCol) {
            cell.clueNumber = undefined;
        }
      }
    }
    this.placedWords = this.placedWords.filter(pw => pw.id !== wordIdToRemove);
  }

  //Formato para la libreria del react-crossword 
  private formatForReactCrossword(): CrosswordData {
    const data: CrosswordData = { across: {}, down: {}, grid: [] };

    if (this.placedWords.length === 0) {
      //console.log("formatForReactCrossword: Ninguna palabra se ha posicionado. Se devuelve por tanto un grid vacio.");
      data.grid = Array(1).fill(null).map(() => Array(1).fill(null));
      return data;
    }

    let minR = Infinity;
    let minC = Infinity;
    let maxR = -Infinity;
    let maxC = -Infinity;

    this.placedWords.forEach(pw => {
      minR = Math.min(minR, pw.startRow);
      minC = Math.min(minC, pw.startCol);
      if (pw.direction === 'across') {
        maxR = Math.max(maxR, pw.startRow);
        maxC = Math.max(maxC, pw.startCol + pw.word.length - 1);
      } else {
        maxR = Math.max(maxR, pw.startRow + pw.word.length - 1);
        maxC = Math.max(maxC, pw.startCol);
      }
    });

    const subGridHeight = maxR - minR + 1;
    const subGridWidth = maxC - minC + 1;

    if (subGridHeight <= 0 || subGridWidth <= 0 || !isFinite(subGridHeight) || !isFinite(subGridWidth)) {
        console.warn("formatForReactCrossword: Las dimensiones calculadas para el grid secundario son invalidas o infinitas. Se devuelve por tanto un grid vacio.", { subGridHeight, subGridWidth, minR, maxR, minC, maxC, placedWordsCount: this.placedWords.length });
        data.grid = Array(1).fill(null).map(() => Array(1).fill(null));
        return data;
    }

    data.grid = Array(subGridHeight).fill(null).map(() => Array(subGridWidth).fill(null));

    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        const reactGridRow = r - minR;
        const reactGridCol = c - minC;

        if (r < 0 || r >= this.gridSize || c < 0 || c >= this.gridSize) {
            console.warn(`formatForReactCrossword: Grid interno fuera de los limites [${r}][${c}]. Marcados como null.`);
            data.grid[reactGridRow][reactGridCol] = null;
            continue;
        }

        const internalCell = this.currentGrid[r][c];

        if (internalCell.isOccupied) {
          const cellData: ReactCrosswordGridCell = {
            char: internalCell.char,
          };
          if (typeof internalCell.clueNumber === 'number' && !isNaN(internalCell.clueNumber)) {
              cellData.number = internalCell.clueNumber;
          }
          data.grid[reactGridRow][reactGridCol] = cellData;
        } else {
          data.grid[reactGridRow][reactGridCol] = null;
        }
      }
    }

    // Ordenamiento de las palabras utilizadas
    const sortedPlacedWords = [...this.placedWords].sort((a, b) => a.clueNumber - b.clueNumber);

    sortedPlacedWords.forEach(pw => {
      const entry = {
        clue: pw.hint,
        answer: pw.answer,
        row: pw.startRow - minR,
        col: pw.startCol - minC,
      };

      if (typeof pw.clueNumber === 'number' && !isNaN(pw.clueNumber)) {
          if (pw.direction === 'across') {
            data.across[pw.clueNumber] = entry;
          } else {
            data.down[pw.clueNumber] = entry;
          }
      } else {
          //console.error(`formatForReactCrossword: clueNumber invalido en placedWord:`, pw);
      }
    });
    //console.log("formatForReactCrossword: Estructura final del CrosswordData:", JSON.stringify(data, null, 2));

    return data;
  }
}

export { CrosswordGenerator };