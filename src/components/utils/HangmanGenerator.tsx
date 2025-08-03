import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import HangmanFigure from "@/components/ui/hangman-figure";
import { Score, GameData } from "@/pages/games/hangman/hangman-types";

//Letras del teclado virtual
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

//Constante para normalizar los string y eliminar los caracteres especiales (acentos y mayusculas) al momento de escribir en el teclado virtual
const normalizeString = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

//Interfaz para manejar la logica del juego y el renderizado
interface HangmanGameProps {
  gameData: GameData;
  difficultyOption: { maxIncorrectGuesses: number, wordValue: number, label: string };
  onGuess: (letter: string | null) => void;
  onEndGame: (finalStatus: "won" | "lost", finalScore: number) => void;
  onRestart: () => void;
  session: any;
  scores: Score[];
  saveScores: (newScores: Score[]) => void;
}

//Función para la fecha a utilizar en la puntuación
function getNowDate() {
    return new Date().toISOString().slice(0, 10);
}

//Componente principal para la configuración del juego 
const HangmanGame: React.FC<HangmanGameProps> = ({
  gameData,
  difficultyOption,
  onGuess,
  onEndGame,
  onRestart,
  session,
  scores,
  saveScores,
}) => {
  const { wordToGuess, guessedLetters, incorrectGuesses, status, timer, finalScore } = gameData;
  const { maxIncorrectGuesses, wordValue, label } = difficultyOption;

  const [showEnd, setShowEnd] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  //Configuración del estado de partida
  const endGame = useCallback((gameStatus: "won" | "lost", message: string) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    let calculatedScore = 0;
    //Calculo de puntuación y guardado en caso de haber ganado
    if (gameStatus === "won") {
      const user = session?.user?.nickname || "Anónimo";
      const remainingAttempts = maxIncorrectGuesses - incorrectGuesses;
      calculatedScore = wordValue * timer * remainingAttempts;
      toast.success("¡Has ganado!");
      const newScore: Score = {
        date: getNowDate(),
        word: wordToGuess,
        score: calculatedScore,
        difficulty: label,
        user,
        wordValue,
        remainingTime: timer,
        remainingAttempts,
      };
      saveScores([newScore, ...scores]);
    } else {
      toast.error(message);
    }
    
    //Actualización de estado al terminar partida
    onEndGame(gameStatus, calculatedScore);
    
    setShowEnd(true);
  }, [incorrectGuesses, wordValue, timer, wordToGuess, label, session, scores, saveScores, maxIncorrectGuesses, onEndGame]);

  //Logica del temporizador
  useEffect(() => {
    if (status === 'playing' && timer > 0) {//Configuración en partida
      timerRef.current = setInterval(() => {
        onGuess(null);
      }, 1000);
    } else if (timer === 0 && status === 'playing') {//Configuración de derrota por acabarse el tiempo
      endGame("lost", "¡Se acabó el tiempo!");
    }
    //Reiniciar temporizador
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status, timer, endGame, onGuess]);

  //Verificación de condicionales de victoria o derrota
  useEffect(() => {
    if (status !== "playing") return;
    
    //Normalización de palabra a adivinar
    const normalizedWord = normalizeString(wordToGuess).replace(/ /g, '');

    //Verificación de victoria
    const isWordGuessed = normalizedWord.split("").every(letter => guessedLetters.has(letter));
    if (isWordGuessed) {
      endGame("won", "¡Has ganado!");
      return;
    }

    //Verificación de derrota
    if (incorrectGuesses >= maxIncorrectGuesses) {
      endGame("lost", "¡Has perdido!");
    }
  }, [wordToGuess, guessedLetters, incorrectGuesses, status, maxIncorrectGuesses, endGame]);

  //Función para renderizado de la palabra oculta
  const renderWord = useMemo(() => {
    return wordToGuess
      .split("")
      .map((letter, index) => {
        const isSpace = letter === " ";
        //Normalización de letras
        const normalizedLetter = normalizeString(letter);
        const isLetterVisible = guessedLetters.has(normalizedLetter) || status !== "playing";
        
        return (
          <span
            key={index}
            className={`text-2xl font-bold p-1 md:p-2 mx-0.5 sm:mx-1 transition-all duration-300
              ${isSpace
                ? "border-none text-gray-800"
                : "border-b-2 md:border-b-4 border-gray-400"
              }
              ${isLetterVisible && !isSpace ? "text-gray-800" : "text-transparent"}
            `}
          >
            {isSpace ? " " : letter}
          </span>
        );
      });
  }, [wordToGuess, guessedLetters, status]);


  return (
    <>
      <div className="flex justify-center items-center h-[180px] mb-4 md:h-[220px]">
        <HangmanFigure incorrectGuesses={incorrectGuesses} />
      </div>

      {/* Palabra a adivinar */}
      <div className="flex justify-center flex-wrap gap-1 mb-4 md:gap-2 text-center max-w-full overflow-hidden">
        {renderWord}
      </div>

      {/* Teclado virtual */}
      <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-10 gap-1 sm:gap-2 w-full max-w-xl mx-auto mb-4">
        {alphabet.map((letter) => (
          <Button
            key={letter}
            onClick={() => onGuess(letter.toLowerCase())}
            disabled={guessedLetters.has(normalizeString(letter)) || status !== "playing"}
            className={`py-2 text-md font-bold rounded-lg shadow transition-colors duration-200
              ${guessedLetters.has(normalizeString(letter))
                ? normalizeString(wordToGuess).includes(normalizeString(letter))
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }
            `}
          >
            {letter}
          </Button>
        ))}
      </div>

      {/* Ventana de fin de partida */}
      {showEnd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-6 items-center animate-in fade-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-center">
              {status === "won" ? "¡Felicidades, has ganado!" : "Lo siento, has perdido."}
            </h2>
            <div className="w-full bg-slate-50 rounded-xl p-4 flex flex-col items-center">
              <span className="font-semibold text-lg mb-2">La palabra era:</span>
              <span className="font-bold text-blue-700 text-3xl">{wordToGuess}</span>
              <div className="mt-4 text-center">
                <span className="font-semibold text-lg">Puntuación Final:</span>
                <p className="font-bold text-blue-700 text-4xl">{finalScore}</p>
                {status === "won"}
              </div>
            </div>
            <Button
              className="w-full mt-2 text-lg py-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
              onClick={() => {
                setShowEnd(false);
                onRestart();
              }}
            >
              Jugar de Nuevo
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
    </>
  );
};

export default HangmanGame;
