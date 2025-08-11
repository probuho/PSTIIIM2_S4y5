import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useSession } from "@/components/context/auth-context";
import { toast } from "sonner";
import { useHybridScores } from "@/hooks/useHybridScores";
import { useUnsplashImage } from "@/hooks/useUnsplashImage";
import HangmanGame from "@/components/utils/HangmanGenerator";
import { Score, GameData } from "./hangman-types";
import animalNames from "./hangman-list.json";

//Constante para normalizar los string y eliminar los caracteres especiales (acentos y mayusculas) al momento de escribir en el teclado virtual
const normalizeString = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

//Dificultades
const difficultyOptions = [
  { value: "easy", label: "Fácil", maxIncorrectGuesses: 10, timeLimit: 60, wordValue: 10, multiplier: 1.0 },
  { value: "medium", label: "Normal", maxIncorrectGuesses: 8, timeLimit: 45, wordValue: 15, multiplier: 1.2 },
  { value: "hard", label: "Difícil", maxIncorrectGuesses: 6, timeLimit: 30, wordValue: 20, multiplier: 1.5 },
];

export default function HangmanPage() {
  const { session } = useSession();
  const { scores: topScores, loading: loadingScores, error: scoresError, saveScore, refreshScores } = useHybridScores("Hangman", 5);
  
  const [difficulty, setDifficulty] = useState("easy");
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEnd, setShowEnd] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<"won" | "lost" | null>(null);

  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Hook para imagen de Unsplash (solo cuando se completa la palabra)
  const imageQuery = gameData?.status === "won" ? gameData.wordToGuess : "animal";
  const { image: successImage, loading: imageLoading } = useUnsplashImage(imageQuery);

  //Guardado en memoria de la dificultad actual
  const currentDifficultyOption = useMemo(() => {
    return difficultyOptions.find((opt) => opt.value === difficulty);
  }, [difficulty]);

  //Función para nueva partida
  const startNewGame = useCallback(() => {
    const currentDifficulty = currentDifficultyOption;
    if (!currentDifficulty || animalNames.length === 0) return;

    //Pantalla de carga
    setIsLoading(true);
    setShowEnd(false);
    setGameStatus(null);

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

    setGameStatus(finalStatus);
    setFinalScore(finalScore);

    // Guardar puntuación usando el hook híbrido
    if (finalStatus === "won") {
      const userName = session?.user?.nickname || session?.user?.name || "Usuario Invitado";
      const userId = session?.user?.id;
      
      saveScore({
        userId,
        userName,
        game: "Hangman",
        score: finalScore,
        movimientos: prevGameData?.guessedLetters.size || 0,
        tiempo: prevGameData?.timer || 0,
        dificultad: difficulty
      });
    }

    setShowEnd(true);
    toast.success(finalStatus === "won" ? "¡Palabra adivinada!" : "¡Juego terminado!");
  }, [session, difficulty, saveScore]);

  const handleDifficultyChange = (v: string) => {
    if (v) {
      setDifficulty(v);
      setShowEnd(false);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Título y descripción */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          🎯 Juego del Ahorcado
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Adivina el nombre del animal antes de que se complete el ahorcado. 
          ¡Cada letra correcta te acerca a la victoria!
        </p>
      </div>

      {/* Panel de control mejorado */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6 shadow-lg">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Configuración de dificultad */}
          <div className="space-y-4 bg-white rounded-lg p-4 shadow-sm">
            <Label className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              🎯 Dificultad
            </Label>
            <ToggleGroup
              type="single"
              value={difficulty}
              onValueChange={handleDifficultyChange}
              className="justify-start"
            >
              {difficultyOptions.map((opt) => (
                <ToggleGroupItem
                  key={opt.value}
                  value={opt.value}
                  className="px-4 py-2 data-[state=on]:bg-purple-600 data-[state=on]:text-white"
                >
                  {opt.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            
            <Button 
              onClick={startNewGame} 
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md"
            >
              🎮 Nuevo Juego
            </Button>
          </div>

          {/* Estadísticas del juego */}
          <div className="xl:col-span-2 space-y-4">
            <Label className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              📊 Estadísticas del Juego
            </Label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-500">🎯</span>
                  <p className="text-sm text-gray-600 font-medium">Letras Adivinadas</p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {gameData ? gameData.guessedLetters.size : 0}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-500">💀</span>
                  <p className="text-sm text-gray-600 font-medium">Intentos Restantes</p>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {gameData ? currentDifficultyOption!.maxIncorrectGuesses - gameData.incorrectGuesses : currentDifficultyOption?.maxIncorrectGuesses || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-500">⏱️</span>
                  <p className="text-sm text-gray-600 font-medium">Tiempo Restante</p>
                </div>
                <ProgressBar 
                  current={gameData?.timer || 0} 
                  max={currentDifficultyOption?.timeLimit || 60}
                  showLabel={false}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablero del Ahorcado */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-2xl shadow-xl p-6 w-full max-w-6xl">
            {isLoading ? (
              <div className="text-center space-y-4 py-8">
                <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-lg text-gray-500">Generando juego...</p>
              </div>
            ) : gameData ? (
              <HangmanGame
                gameData={gameData}
                difficultyOption={currentDifficultyOption!}
                onGuess={handleGuess}
                onEndGame={handleEndGame}
                onRestart={startNewGame}
                session={session}
                scores={topScores}
                saveScores={() => {}}
              />
            ) : (
              <div className="text-center space-y-4 py-8">
                <div className="text-6xl">🎯</div>
                <p className="text-lg text-gray-500">
                  Comienza un nuevo juego seleccionando la dificultad.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top puntuaciones mejorado */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
            🏆 Top 5 Puntuaciones
            <span className="text-sm font-normal text-gray-600 bg-white/70 px-3 py-1 rounded-full">
              ¡Compite por el primer lugar!
            </span>
          </h2>
          <Button 
            onClick={refreshScores} 
            variant="outline" 
            size="sm"
            disabled={loadingScores}
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
          >
            {loadingScores ? "🔄 Actualizando..." : "🔄 Actualizar"}
          </Button>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-inner">
          {loadingScores ? (
            <div className="text-center text-gray-500 py-8">
              <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              Cargando puntuaciones...
            </div>
          ) : scoresError ? (
            <div className="text-center text-red-500 py-8">
              <span className="text-2xl">❌</span>
              <p className="mt-2">{scoresError}</p>
            </div>
          ) : topScores.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <span className="text-4xl">🎯</span>
              <p className="mt-2 text-lg">No hay puntuaciones aún</p>
              <p className="text-sm">¡Sé el primero en establecer un récord!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topScores.map((score, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                  i === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300 shadow-lg' :
                  i === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300' :
                  i === 2 ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300' :
                  'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                      i === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                      i === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 
                      i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 
                      'bg-gradient-to-br from-blue-400 to-blue-600'
                    }`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900 text-lg">{score.userName}</span>
                      {score.isAuthenticated ? (
                        <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium border border-green-200">
                          ✅ Verificado
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full font-medium border border-gray-200">
                          👤 Invitado
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold text-2xl ${
                      i === 0 ? 'text-yellow-700' : 
                      i === 1 ? 'text-gray-700' : 
                      i === 2 ? 'text-orange-700' : 
                      'text-blue-700'
                    }`}>
                      {score.score.toLocaleString()}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{new Date(score.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de fin de juego mejorado */}
      <Dialog open={showEnd} onOpenChange={setShowEnd}>
        <DialogContent className="sm:max-w-lg">
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg ${
                gameStatus === "won" 
                  ? 'bg-gradient-to-br from-green-400 to-blue-600' 
                  : 'bg-gradient-to-br from-red-400 to-pink-600'
              }`}>
                <span className="text-4xl">{gameStatus === "won" ? '🎉' : '💀'}</span>
              </div>
              <h2 className={`text-3xl font-bold bg-clip-text text-transparent ${
                gameStatus === "won" 
                  ? 'bg-gradient-to-r from-green-600 to-blue-600' 
                  : 'bg-gradient-to-r from-red-600 to-pink-600'
              }`}>
                {gameStatus === "won" ? '¡Palabra Adivinada!' : '¡Juego Terminado!'}
              </h2>
              <p className="text-gray-600 text-lg">
                {gameStatus === "won" 
                  ? '¡Excelente trabajo! Has adivinado la palabra correctamente.' 
                  : 'No te rindas, ¡puedes intentarlo de nuevo!'}
              </p>
            </div>
            
            {/* Imagen de Unsplash si ganó */}
            {gameStatus === "won" && successImage && (
              <div className="bg-white rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
                <img 
                  src={successImage.urls.regular} 
                  alt={successImage.alt_description}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50">
                  <p className="text-sm text-gray-600">
                    📸 {successImage.user.name} en Unsplash
                  </p>
                </div>
              </div>
            )}
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 space-y-4 border border-purple-200">
              <div className="bg-white rounded-lg p-3 text-center border border-purple-200">
                <div className="text-purple-500 text-sm font-medium mb-1">Puntuación Final</div>
                <div className="text-2xl font-bold text-purple-600">{finalScore}</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-purple-200">
                <div className="text-purple-500 text-sm font-medium mb-1">Dificultad</div>
                <div className="text-xl font-bold text-purple-600 capitalize">{difficulty}</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowEnd(false)} 
                variant="outline" 
                className="flex-1 border-gray-300 hover:bg-gray-50"
              >
                👀 Continuar
              </Button>
              <Button 
                onClick={() => {
                  setShowEnd(false);
                  startNewGame();
                }} 
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md"
              >
                🎮 Jugar de nuevo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
