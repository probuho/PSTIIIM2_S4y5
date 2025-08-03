import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSession } from "@/components/context/auth-context";
import { toast } from "sonner";

//Componentes del crossword de la librería react-crossword
import Crossword, { type CrosswordImperative, type CellInput} from '@jaredreisinger/react-crossword';

import listadoPalabrasData from "./crossword-list.json";
import {
  CrosswordGenerator,
  type PlacedWord,
  type WordEntry,
  type GeneratorResult,
  type CrosswordData
} from "@/components/utils/CrosswordGenerator";


//Dificultades
const difficultyOptions = [
  { value: "easy", label: "Fácil", wordCount: 5, multiplier: 1.0, gridSize: 10 },
  { value: "medium", label: "Normal", wordCount: 10, multiplier: 1.2, gridSize: 15 },
  { value: "hard", label: "Difícil", wordCount: 15, multiplier: 1.5, gridSize: 20 },
];
//Puntuacion
type Score = {
  date: string;
  score: number;
  difficulty: string;
  user: string;
};

//Función para la fecha a utilizar en el historial
function getNowDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function CrosswordPage() {
  const { session } = useSession();
  const [difficulty, setDifficulty] = useState("easy");
  const [generationResult, setGenerationResult] = useState<GeneratorResult | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [correctWordsGuessed, setCorrectWordsGuessed] = useState<Set<string>>(new Set());
  const [showEnd, setShowEnd] = useState(false);
  const [scores, setScores] = useState<Score[]>([]);
  const [isGameActive, setIsGameActive] = useState(false);

  const crosswordRef = useRef<CrosswordImperative>(null);

  //Configuración de la puntuación
  useEffect(() => {
    const key = "crossword-scores";
    const raw = window.localStorage.getItem(key);
    if (raw) {
      setScores(JSON.parse(raw));
    }
  }, []);
  const saveScores = useCallback((newScores: Score[]) => {
    setScores(newScores);
    window.localStorage.setItem("crossword-scores", JSON.stringify(newScores));
  }, []);

  //Guardado en memoria de la dificultad actual
  const currentDifficultyOption = useMemo(() => {
    return difficultyOptions.find((opt) => opt.value === difficulty);
  }, [difficulty]);

  //Configuración de nueva partida
  const startNewGame = useCallback(() => {
    const currentDifficulty = difficultyOptions.find((opt) => opt.value === difficulty);
    if (!currentDifficulty) {
      //console.error("Configuración de dificultad no encontrada", difficulty);
      return;
    }

    //Constantes para la generación y manipulación del crucigrama
    const wordsForGenerator: WordEntry[] = listadoPalabrasData as WordEntry[];
    const shuffledWords = [...wordsForGenerator].sort(() => 0.5 - Math.random());
    const selectedWords = shuffledWords.slice(0, currentDifficulty.wordCount);

    let result: GeneratorResult | null = null;
    let attempts = 0;
    const MAX_GENERATION_ATTEMPTS = 10; //Limite de intentos para prevenir loops infinitos

    while (!result && attempts < MAX_GENERATION_ATTEMPTS) {
      const generator = new CrosswordGenerator(selectedWords, currentDifficulty.gridSize);
      result = generator.generate();
      attempts++;
      if (!result && attempts < MAX_GENERATION_ATTEMPTS) {
          console.warn(`Crossword generation failed on attempt ${attempts}. Retrying...`);
      }
    }

    //Console.log mensajes para testing 
    {/*console.log("Palabras seleccionadas para generar:", selectedWords);
    console.log("Tamaño del grid para la generación:", currentDifficulty.gridSize);
    console.log("Resultado de generación:", result); */}
    setGenerationResult(result);

    //Reinicio de los estados del juego al generar un nuevo crucigrama
    crosswordRef.current?.reset();
    setCurrentScore(0);
    setCorrectWordsGuessed(new Set());
    setShowEnd(false);
    setIsGameActive(true);

    //En caso de fallar la generación del crucigrama
    if (!result || !result.crosswordData || !result.crosswordData.grid) {
      //console.error("No se pudo generar el crucigrama después de ${MAX_GENERATION_ATTEMPTS} intentos. Resultado:", result);
      toast.error("No se pudo generar un crucigrama con las palabras seleccionadas. Intente de nuevo.");
      setIsGameActive(false);
    }
  }, [difficulty]);

  //Efecto para comenzar un nuevo juego cuando se cambia la dificultad
  useEffect(() => {
    startNewGame();
  }, [difficulty, startNewGame]);

  // Preparación del las palabras y los datos del crucigrama para generar el resultado
  const placedWords = useMemo(() => generationResult?.placedWords || [], [generationResult]);

  const crosswordData = useMemo<CrosswordData | null>(() => { 
    if (generationResult && generationResult.crosswordData && generationResult.crosswordData.grid) {
      //console.log("Datos del crucigrama listo para utilizar desde el useMemo.");
      return generationResult.crosswordData;
    }
    //console.log("Los datos del crucigrama no estan listos en el useMemo o estos son invalidos. El valor de estos es null");
    return null;
  }, [generationResult]);

  //Efecto para determinar la completación del juego y guardar la puntuación
  useEffect(() => {
    if (isGameActive && placedWords.length > 0 && correctWordsGuessed.size === placedWords.length) {
      const user = session?.user?.nickname || "Anónimo";
      const finalScoreToSave = currentScore;

      const newScore: Score = {
        date: getNowDate(),
        score: finalScoreToSave,
        difficulty: currentDifficultyOption?.label || difficulty,
        user,
      };
      const newScores = [newScore, ...scores];
      saveScores(newScores);
      toast.success("Felicitaciones, has completado el crucigrama.");
      setShowEnd(true);
      setIsGameActive(false);
    }
  }, [correctWordsGuessed.size, placedWords.length, difficulty, session, isGameActive, scores, saveScores, currentScore, currentDifficultyOption]);


  const handleWordCorrect = useCallback((direction: 'across' | 'down', number: string) => {
    const wordId = `${number}-${direction}`;

    if (!correctWordsGuessed.has(wordId)) {
      setCorrectWordsGuessed(prev => {
        const newSet = new Set(prev).add(wordId);
        const multiplier = currentDifficultyOption?.multiplier || 1.0;
        const pointsPerWord = 100;
        const scoreToAdd = pointsPerWord * multiplier;

        setCurrentScore(s => s + scoreToAdd);
        return newSet;
      });
    }
  }, [correctWordsGuessed, currentDifficultyOption]);

  //Estetica del crucigrama
  const crosswordTheme = useMemo(() => ({
    gridBackground: 'white',
    cellBackground: 'white',
    cellBorder: 'rgba(0,0,0,0.5)',
    textColor: 'black',
    numberColor: 'black',
    focusBackground: '#e0f2fe',
    highlightBackground: '#bfdbfe',
    clueBackground: 'transparent',
    clueColor: 'black',
  }), []);

  //Cambio en la dificultad
  const handleDifficultyChange = (v: string) => {
    if (v) {
      setDifficulty(v);
      setShowEnd(false);
    }
  };

  //Carga de las puntuaciones
  const displayedScores = useMemo(() => scores.slice(0, 3), [scores]);

  //Renderizado de las celdas del crucigrama
  const renderCustomCell = useCallback((cell: CellInput) => {
      //Acceso a las palabras seleccionadas (placedWords) desde el estado derivado con el resultado generado
      if (!crosswordData || !placedWords) return null;

      //Verificacion de si es una celda acertada
      let isCellInCorrectWord = false;
      let correctLetter = '';

      //Loop de todas las palabras acertadas
      for (const wordId of correctWordsGuessed) {
          const [num, dir] = wordId.split('-');
          const direction = dir as 'across' | 'down';
          const number = parseInt(num, 10);

          const foundWord = placedWords.find(
              (pw) => pw.clueNumber === number && pw.direction === direction
          );

          //Verificación de coordenadas de las palabras
          if (foundWord) {
              const wordStartX = foundWord.startCol;
              const wordStartY = foundWord.startRow;
              const wordLength = foundWord.answer.length;

              if (direction === 'across') {
                  if (cell.x >= wordStartX && cell.x < wordStartX + wordLength && cell.y === wordStartY) {
                      isCellInCorrectWord = true;
                      correctLetter = foundWord.answer[cell.x - wordStartX];
                      break;
                  }
              } else {
                  if (cell.y >= wordStartY && cell.y < wordStartY + wordLength && cell.x === wordStartX) {
                      isCellInCorrectWord = true;
                      correctLetter = foundWord.answer[cell.y - wordStartY];
                      break;
                  }
              }
          }
      }

      if (isCellInCorrectWord) {
        return (
          <g>
            <rect
              x={0} y={0} width={1} height={1}
              fill="#d1fae5"
            />
            {cell.number && (
                <text
                    x={0.05} y={0.25}
                    fontSize={0.2}
                    textAnchor="start"
                    dominantBaseline="hanging"
                    fill="black"
                    style={{ pointerEvents: 'none' }}
                >
                    {cell.number}
                </text>
            )}
            <text
                x={0.5} y={0.5}
                fontSize={0.6}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="black"
                className="font-bold"
                style={{ pointerEvents: 'none' }}
            >
                {correctLetter.toUpperCase()}
            </text>
          </g>
        );
      }
      return null;
  }, [correctWordsGuessed, placedWords, crosswordData]);

  return (
    <div className="flex flex-col md:flex-row gap-10 w-full h-[calc(100vh-64px)] p-6 max-w-[1600px] mx-auto">
      {/* Panel izquierdo */}
      <div className="w-full md:w-[340px] bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col gap-6 mb-4 md:mb-0">
        <Label className="text-lg mb-2">Dificultad</Label>
        <ToggleGroup
          type="single"
          value={difficulty}
          onValueChange={handleDifficultyChange}
          className="w-full gap-4 mb-2"
        >
          {difficultyOptions.map((opt) => (
            <ToggleGroupItem
              key={opt.value}
              value={opt.value}
              variant={difficulty === opt.value ? "outline" : "default"}
              size="lg"
              className="flex-1 py-4 px-0 rounded-xl text-base shadow-sm border-2 data-[state=on]:border-blue-600 data-[state=on]:bg-blue-50"
            >
              {opt.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {/* Puntuación actual */}
        <div>
          <Label className="text-md">Puntuación Actual</Label>
          <div className="flex justify-between mt-2 text-sm">
            <span>Palabras Correctas: <span className="font-bold text-blue-700">{correctWordsGuessed.size}/{placedWords.length}</span></span>
            <span>Puntuación: <span className="font-bold text-blue-700">{currentScore}</span></span>
          </div>
        </div>

        {/* Historial de puntuaciones */}
        <div className="flex-grow overflow-y-auto">
          <Label className="text-md mb-2">Historial de Puntuaciones</Label>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Puntos</TableHead>
                <TableHead>Dificultad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedScores.map((score, i) => (
                <TableRow key={i}>
                  <TableCell>{score.date}</TableCell>
                  <TableCell>{score.user}</TableCell>
                  <TableCell>{score.score}</TableCell>
                  <TableCell>{score.difficulty}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Tablero del crucigrama y las pistas (lado derecho) */}
      <div className="flex-1 flex flex-col w-full h-full overflow-y-auto">
        {/* Título y boton de reinicio de juego */}
        <div className="flex items-center justify-between w-full max-w-5xl mb-4 self-center md:self-auto px-6 md:px-0">
          <Label className="text-2xl">Crucigrama de identificación de especies</Label>
          <Button onClick={startNewGame}>Reiniciar Juego</Button>
        </div>

        {/* Grid del crucigrama */}
        <div className="bg-white/90 rounded-2xl shadow-lg p-6 w-full mx-auto flex justify-center items-center flex-grow-0 flex-shrink-0 mb-6">
          {crosswordData ? (
            <div style={{
                aspectRatio: '1 / 1',
                width: '100%',
                maxWidth: 'min(700px, 95vw)',
            }}>
              <Crossword
                data={crosswordData}
                ref={crosswordRef}
                onCorrect={handleWordCorrect}
                theme={crosswordTheme}
                gridBackground='transparent'
                cellBorder={{ thickness: 1, color: 'black' }}
                use="responsive"
                renderCell={renderCustomCell}
              />
            </div>
          ) : (
            <p className="text-center text-lg text-gray-500">
              {/* En caso de que los datos del crucigrama fuesen nulos*/}
              Generando crucigrama... Si tarda mucho, intenta reiniciar o cambiar la dificultad.
            </p>
          )}
        </div>

        {/* Ventana de juego finalizado */}
        {showEnd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-6 items-center animate-in fade-in max-h-[90vh] overflow-y-auto">
              <h2 className="text-3xl font-bold text-center">¡Crucigrama Completado!</h2>
              <div className="w-full bg-slate-50 rounded-xl p-4 flex flex-col items-center">
                <span className="font-semibold text-lg mb-2">Puntuación Final</span>
                <div className="flex justify-center gap-12 text-xl">
                  <div>
                    Palabras Correctas:<br />
                    <span className="font-bold text-blue-700 text-3xl">{correctWordsGuessed.size}</span>
                  </div>
                  <div>
                    Puntuación Total:<br />
                    <span className="font-bold text-blue-700 text-3xl">{currentScore}</span>
                  </div>
                </div>
              </div>
              <div className="w-full bg-slate-50 rounded-xl p-4">
                <span className="font-semibold text-lg block mb-2">Historial de Puntuaciones</span>
                <div className="flex flex-col gap-2">
                  {displayedScores.map((score, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 text-sm shadow border">
                      <span className="text-xs text-muted-foreground w-24">{score.date}</span>
                      <span className="flex-1">Puntos: <b>{score.score}</b>, Dificultad: <b>{score.difficulty}</b></span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Seleccion de dificultad para nuevo juego */}
              <div className="w-full bg-slate-50 rounded-xl p-4 flex flex-col gap-3 items-center">
                <span className="font-semibold text-lg">Selecciona Dificultad para jugar de nuevo</span>
                <ToggleGroup
                  type="single"
                  value={difficulty}
                  onValueChange={handleDifficultyChange}
                  className="w-full gap-4"
                >
                  {difficultyOptions.map((opt) => (
                    <ToggleGroupItem
                      key={opt.value}
                      value={opt.value}
                      variant={difficulty === opt.value ? "outline" : "default"}
                      size="lg"
                      className="flex-1 py-3 px-0 rounded-xl text-base shadow-sm border-2 data-[state=on]:border-blue-600 data-[state=on]:bg-blue-50"
                    >
                      {opt.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
              <Button
                className="w-full mt-2 text-lg py-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                onClick={() => {
                  setShowEnd(false);
                  startNewGame();
                }}
              >
                Nueva partida
              </Button>
              <Button
                className="w-full text-lg py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold"
                onClick={() => setShowEnd(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}