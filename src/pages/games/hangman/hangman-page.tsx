import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSession } from "@/components/context/auth-context";
import { toast } from "sonner";
import HangmanGame from "@/components/utils/HangmanGenerator";
import { Score, GameData } from "./hangman-types";
import animalNames from "./hangman-list.json";

//Constante para normalizar los string y eliminar los caracteres especiales (acentos y mayusculas) al momento de escribir en el teclado virtual
const normalizeString = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

//Dificultades
const difficultyOptions = [
  { value: "easy", label: "Fácil", maxIncorrectGuesses: 10, timeLimit: 60, wordValue: 10 },
  { value: "medium", label: "Normal", maxIncorrectGuesses: 8, timeLimit: 45, wordValue: 15 },
  { value: "hard", label: "Difícil", maxIncorrectGuesses: 6, timeLimit: 30, wordValue: 20 },
];


export default function HangmanPage() {
  const { session } = useSession();
  const [difficulty, setDifficulty] = useState("easy");
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  //Guardado en memoria de la dificultad actual
  const currentDifficultyOption = useMemo(() => {
    return difficultyOptions.find((opt) => opt.value === difficulty);
  }, [difficulty]);

  //Carga de puntuación
  useEffect(() => {
    const key = "hangman-scores";
    const raw = window.localStorage.getItem(key);
    if (raw) {
      setScores(JSON.parse(raw));
    }
  }, []);

  //Almacenamiento de puntuación
  const saveScores = useCallback((newScores: Score[]) => {
    setScores(newScores);
    window.localStorage.setItem("hangman-scores", JSON.stringify(newScores));
  }, []);

  //Función para nueva partida
  const startNewGame = useCallback(() => {
    const currentDifficulty = currentDifficultyOption;
    if (!currentDifficulty || animalNames.length === 0) return;

    //Pantalla de carga
    setIsLoading(true);

    //Carga de partida
    loadingTimerRef.current = setTimeout(() => {
      let wordsToUse: string[];
      if (currentDifficulty.value === "easy") {
        //Restricción de nombres utilizados en la dificultad fácil para solo usar nombres que tengan una sola palabra
        wordsToUse = animalNames.filter(word => !word.includes(" "));
      } else {
        wordsToUse = animalNames;
      }

      if (wordsToUse.length === 0) {
        toast.error("No hay palabras disponibles para esta dificultad.");
        setIsLoading(false);
        return;
      }
      
      const randomIndex = Math.floor(Math.random() * wordsToUse.length);
      const newWord = wordsToUse[randomIndex];

      const newGameData: GameData = {
        wordToGuess: newWord.toUpperCase(),
        guessedLetters: new Set(),
        incorrectGuesses: 0,
        status: "playing",
        timer: currentDifficulty.timeLimit,
        finalScore: 0,
      };

      setGameData(newGameData);

      //Eliminación de la pantalla de carga
      setIsLoading(false);
      toast.success("¡Nueva partida iniciada!");
    }, 1000);
  }, [currentDifficultyOption]);

  //Componente para comenzar nueva partida
  useEffect(() => {
    startNewGame();
    return () => {
        if (loadingTimerRef.current) {
            clearTimeout(loadingTimerRef.current);
        }
    };
  }, [difficulty, startNewGame]);

  //Manejo de las letras adivinadas
  const handleGuess = useCallback((letter: string | null) => {
    setGameData((prevGameData) => {
      if (!prevGameData || prevGameData.status !== "playing" || (letter && prevGameData.guessedLetters.has(letter))) {
        return prevGameData;
      }

      if (letter === null) {
        return {
          ...prevGameData,
          timer: prevGameData.timer - 1,
        };
      }

      //Normalización de letra adivinada
      const normalizedLetter = normalizeString(letter);
      if (!/[a-z]/.test(normalizedLetter)) {
        return prevGameData;
      }
      
      const newGuessedLetters = new Set(prevGameData.guessedLetters).add(normalizedLetter);
      let newIncorrectGuesses = prevGameData.incorrectGuesses;
      const normalizedWord = normalizeString(prevGameData.wordToGuess);
      
      if (!normalizedWord.includes(normalizedLetter)) {
        newIncorrectGuesses++;
      }

      return {
        ...prevGameData,
        guessedLetters: newGuessedLetters,
        incorrectGuesses: newIncorrectGuesses,
      };
    });
  }, []);
  
  //Final de partida
  const handleEndGame = useCallback((finalStatus: "won" | "lost", finalScore: number) => {
    setGameData((prevGameData) => {
      if (!prevGameData) return null;
      return {
        ...prevGameData,
        status: finalStatus,
        finalScore: finalScore,
      };
    });
  }, []);

  //Puntuación almacenada
  const displayedScores = useMemo(() => scores.slice(0, 3), [scores]);

  return (
    <div className="flex flex-col md:flex-row gap-10 w-full h-[calc(100vh-64px)] p-6 max-w-[1600px] mx-auto">
      {/* Panel izquierdo */}
      <div className="w-full md:w-[340px] bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col gap-6 mb-4 md:mb-0">
        <Label className="text-lg mb-2">Dificultad</Label>
        <ToggleGroup
          type="single"
          value={difficulty}
          onValueChange={(newDifficulty) => {
            setDifficulty(newDifficulty);
          }}
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

        {/* Estado de partida */}
        <div>
          <Label className="text-md">Estado del Juego</Label>
          <div className="flex flex-col mt-2 text-sm gap-2">
            <span>Intentos Restantes: <span className="font-bold text-red-600">{gameData ? currentDifficultyOption!.maxIncorrectGuesses - gameData.incorrectGuesses : "-"}</span></span>
            <span>Tiempo Restante: <span className="font-bold text-blue-700">{gameData ? `${gameData.timer}s` : "-"}</span></span>
            <span>Puntuación: <span className="font-bold text-green-600">{gameData ? gameData.finalScore : "-"}</span></span>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedScores.map((score, i) => (
                <TableRow key={i}>
                  <TableCell>{score.date}</TableCell>
                  <TableCell>{score.user}</TableCell>
                  <TableCell className="font-bold text-green-600">
                    {score.score}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Tablero del ahorcado (lado derecho) */}
      <div className="flex-1 flex flex-col w-full h-full overflow-y-auto">
        <div className="flex items-center justify-between w-full max-w-5xl mb-4 self-center md:self-auto px-6 md:px-0">
          <Label className="text-2xl">Adivina el animal</Label>
          <Button onClick={startNewGame}>Reiniciar Juego</Button>
        </div>

        {/* Pantalla de carga en lo que se prepara el tablero */}
        <div className="relative bg-white/90 rounded-2xl shadow-lg p-6 w-full mx-auto flex flex-col justify-between items-center flex-grow mb-6">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl animate-in fade-in">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
              <p className="mt-4 text-xl font-bold text-gray-700">Generando juego...</p>
            </div>
          )}

          {!isLoading && gameData ? (
            <HangmanGame
              gameData={gameData}
              difficultyOption={currentDifficultyOption!}
              onGuess={handleGuess}
              onEndGame={handleEndGame}
              onRestart={startNewGame}
              session={session}
              scores={scores}
              saveScores={saveScores}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-center text-lg text-gray-500">
                Selecciona una dificultad para comenzar.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
