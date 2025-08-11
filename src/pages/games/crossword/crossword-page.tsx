import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSession } from "@/components/context/auth-context";
import { toast } from "sonner";
import { useHybridScores } from "@/hooks/useHybridScores";

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

export default function CrosswordPage() {
  console.log("🚀 CrosswordPage: Componente iniciando...");
  
  const { session } = useSession();
  console.log("🔐 Session:", session);
  
  const { scores: topScores, loading: loadingScores, error: scoresError, saveScore, refreshScores } = useHybridScores("Crucigrama", 5);
  console.log("📊 Scores:", { topScores, loadingScores, scoresError });
  
  const [difficulty, setDifficulty] = useState("easy");
  const [generationResult, setGenerationResult] = useState<GeneratorResult | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [correctWordsGuessed, setCorrectWordsGuessed] = useState<Set<string>>(new Set());
  const [showEnd, setShowEnd] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  
  // Obtener las palabras colocadas del resultado de generación
  const placedWords = generationResult?.placedWords || [];
  console.log("🎯 Placed words:", placedWords);

  const crosswordRef = useRef<CrosswordImperative>(null);

  //Guardado en memoria de la dificultad actual
  const currentDifficultyOption = useMemo(() => {
    return difficultyOptions.find((opt) => opt.value === difficulty);
  }, [difficulty]);

  //Configuración de nueva partida
  const startNewGame = useCallback(() => {
    console.log("🎮 Iniciando nuevo juego con dificultad:", difficulty);
    
    const currentDifficulty = difficultyOptions.find((opt) => opt.value === difficulty);
    if (!currentDifficulty) {
      console.error("❌ Configuración de dificultad no encontrada", difficulty);
      return;
    }

    //Constantes para la generación y manipulación del crucigrama
    const wordsForGenerator: WordEntry[] = listadoPalabrasData as WordEntry[];
    console.log("📚 Palabras disponibles:", wordsForGenerator.length);
    
    const shuffledWords = [...wordsForGenerator].sort(() => 0.5 - Math.random());
    const selectedWords = shuffledWords.slice(0, currentDifficulty.wordCount);
    console.log("🎯 Palabras seleccionadas:", selectedWords);

    let result: GeneratorResult | null = null;
    let attempts = 0;
    const MAX_GENERATION_ATTEMPTS = 10; //Limite de intentos para prevenir loops infinitos

    while (!result && attempts < MAX_GENERATION_ATTEMPTS) {
      console.log(`🔄 Intento ${attempts + 1} de generación...`);
      const generator = new CrosswordGenerator(selectedWords, currentDifficulty.gridSize);
      result = generator.generate();
      attempts++;
      if (!result && attempts < MAX_GENERATION_ATTEMPTS) {
          console.warn(`⚠️ Crossword generation failed on attempt ${attempts}. Retrying...`);
      }
    }

    console.log("✅ Resultado de generación:", result);
    setGenerationResult(result);

    //Reinicio de los estados del juego al generar un nuevo crucigrama
    crosswordRef.current?.reset();
    setCurrentScore(0);
    setCorrectWordsGuessed(new Set());
    setShowEnd(false);
    setIsGameActive(true);

    //En caso de fallar la generación del crucigrama
    if (!result || !result.crosswordData || !result.crosswordData.grid) {
      console.error("❌ No se pudo generar el crucigrama después de", MAX_GENERATION_ATTEMPTS, "intentos. Resultado:", result);
      toast.error("No se pudo generar un crucigrama con las palabras seleccionadas. Intente de nuevo.");
      setIsGameActive(false);
    }
  }, [difficulty]);

  //Efecto para comenzar un nuevo juego cuando se cambia la dificultad
  useEffect(() => {
    console.log("🔄 useEffect: Cambio de dificultad detectado, iniciando nuevo juego...");
    startNewGame();
  }, [difficulty, startNewGame]);

  // Preparación de los datos del crucigrama para generar el resultado
  const crosswordData = useMemo<CrosswordData | null>(() => { 
    console.log("🧠 useMemo: Generando datos del crucigrama...");
    if (generationResult && generationResult.crosswordData && generationResult.crosswordData.grid) {
      console.log("✅ Datos del crucigrama listos:", generationResult.crosswordData);
      return generationResult.crosswordData;
    }
    console.log("❌ Los datos del crucigrama no están listos:", generationResult);
    return null;
  }, [generationResult]);

  //Efecto para determinar la completación del juego y guardar la puntuación
  useEffect(() => {
    if (isGameActive && placedWords.length > 0 && correctWordsGuessed.size === placedWords.length) {
      console.log("🎉 ¡Juego completado! Guardando puntuación...");
      const userName = session?.user?.nickname || session?.user?.name || "Usuario Invitado";
      const userId = session?.user?.id;
      
      // Guardar puntuación usando el hook híbrido
      saveScore({
        userId,
        userName,
        game: "Crucigrama",
        score: currentScore,
        movimientos: correctWordsGuessed.size,
        tiempo: 0, // El crucigrama no tiene timer por ahora
        dificultad: difficulty
      });
      
      toast.success("Felicitaciones, has completado el crucigrama.");
      setShowEnd(true);
      setIsGameActive(false);
    }
  }, [correctWordsGuessed.size, placedWords.length, difficulty, session, isGameActive, saveScore, currentScore]);

  const handleWordCorrect = useCallback((direction: 'across' | 'down', number: string) => {
    console.log("✅ Palabra correcta:", { direction, number });
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
      console.log("🎯 Cambiando dificultad a:", v);
      setDifficulty(v);
      setShowEnd(false);
    }
  };

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

  console.log("🎨 Renderizando CrosswordPage con datos:", { crosswordData, generationResult, isGameActive });

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Título y descripción */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          🦋 Crucigrama de Identificación de Especies
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Identifica diferentes especies de animales resolviendo este crucigrama educativo. 
          ¡Cuanto más palabras completes, mejor puntuación obtendrás!
        </p>
      </div>

      {/* Panel de control mejorado */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6 shadow-lg">
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
                  className="px-4 py-2 data-[state=on]:bg-green-600 data-[state=on]:text-white"
                >
                  {opt.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            
            <Button 
              onClick={startNewGame} 
              className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold shadow-md"
            >
              🎮 Nuevo Juego
            </Button>
          </div>

          {/* Estadísticas del juego - Reorganizadas */}
          <div className="xl:col-span-2 space-y-4">
            <Label className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              📊 Estadísticas del Juego
            </Label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-500">🎯</span>
                  <p className="text-sm text-gray-600 font-medium">Palabras Correctas</p>
                </div>
                <p className="text-2xl font-bold text-green-600">{correctWordsGuessed.size}/{placedWords.length}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-500">🏆</span>
                  <p className="text-sm text-gray-600 font-medium">Puntuación</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">{currentScore}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-500">📈</span>
                  <p className="text-sm text-gray-600 font-medium">Progreso</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {placedWords.length > 0 ? Math.round((correctWordsGuessed.size / placedWords.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablero del crucigrama mejorado */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-2xl shadow-xl p-6 w-full max-w-4xl">
            {crosswordData ? (
              <div style={{
                  aspectRatio: '1 / 1',
                  width: '100%',
                  maxWidth: 'min(700px, 95vw)',
              }}>
                               <div className="react-crossword">
                 <Crossword
                   data={crosswordData}
                   ref={crosswordRef}
                   onCorrect={handleWordCorrect}
                   theme={crosswordTheme}
                   gridBackground='transparent'
                   cellBorder={{ thickness: 1, color: 'black' }}
                   use="responsive"
                   renderCell={renderCustomCell}
                   showPuzzle={false}
                 />
               </div>
              </div>
            ) : (
              <div className="text-center space-y-4 py-8">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-lg text-gray-500">
                  Generando crucigrama... Si tarda mucho, intenta reiniciar o cambiar la dificultad.
                </p>
                <p className="text-sm text-gray-400">
                  Estado: {generationResult ? 'Generado' : 'No generado'} | 
                  Activo: {isGameActive ? 'Sí' : 'No'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenedor de pistas del crucigrama */}
      {crosswordData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 shadow-lg">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              📝 Pistas del Crucigrama
              <span className="text-sm font-normal text-gray-600 bg-white/70 px-3 py-1 rounded-full">
                ¡Usa estas pistas para resolver el crucigrama!
              </span>
            </h3>
            <div className="grid grid-cols-2 gap-8">
                             {/* Pistas ACROSS */}
               <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                 <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                   ➡️ ACROSS (Horizontal)
                 </h4>
                 <div className="space-y-2">
                   {Object.entries(crosswordData.across).map(([number, clue]) => (
                     <div key={number} className="text-sm flex items-start gap-2">
                       <span className="font-bold text-blue-600 min-w-[20px]">{number}:</span>
                       <span className="text-gray-700 leading-relaxed">{clue.clue}</span>
                     </div>
                   ))}
                 </div>
               </div>
               
               {/* Pistas DOWN */}
               <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-indigo-500">
                 <h4 className="font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                   ⬇️ DOWN (Vertical)
                 </h4>
                 <div className="space-y-2">
                   {Object.entries(crosswordData.down).map(([number, clue]) => (
                     <div key={number} className="text-sm flex items-start gap-2">
                       <span className="font-bold text-indigo-600 min-w-[20px]">{number}:</span>
                       <span className="text-gray-700 leading-relaxed">{clue.clue}</span>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

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
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-4xl">🎉</span>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  ¡Crucigrama Completado!
                </h2>
                <p className="text-gray-600 text-lg">¡Excelente trabajo! Has identificado todas las especies.</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 space-y-4 border border-green-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 text-center border border-green-200">
                    <div className="text-green-500 text-sm font-medium mb-1">Palabras Correctas</div>
                    <div className="text-2xl font-bold text-green-600">{correctWordsGuessed.size}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-blue-200">
                    <div className="text-blue-500 text-sm font-medium mb-1">Puntuación Total</div>
                    <div className="text-2xl font-bold text-blue-600">{currentScore}</div>
                  </div>
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
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold shadow-md"
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