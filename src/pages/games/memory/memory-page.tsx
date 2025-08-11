import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSession } from "@/components/context/auth-context";
import { useHybridScores } from "@/hooks/useHybridScores";
import { getAnimalImage } from "@/lib/unsplash-config";
import { toast } from "sonner";

// Configuración de dificultad
const difficultyOptions = [
  { value: "facil", label: "Fácil", size: 4, pairs: 8 },
  { value: "medio", label: "Normal", size: 6, pairs: 12 },
  { value: "dificil", label: "Difícil", size: 8, pairs: 16 },
];

// Animales específicos para el juego con consultas optimizadas
const animalQueries = [
  { query: "amur leopard", name: "Leopardo de Amur" },
  { query: "giant panda", name: "Panda Gigante" },
  { query: "mountain gorilla", name: "Gorila de Montaña" },
  { query: "sumatran tiger", name: "Tigre de Sumatra" },
  { query: "snow leopard", name: "Leopardo de las Nieves" },
  { query: "red panda", name: "Panda Rojo" },
  { query: "orangutan", name: "Orangután" },
  { query: "elephant", name: "Elefante" },
  { query: "rhinoceros", name: "Rinoceronte" },
  { query: "dolphin", name: "Delfín" },
  { query: "whale", name: "Ballena" },
  { query: "sea turtle", name: "Tortuga Marina" },
  { query: "eagle", name: "Águila" },
  { query: "owl", name: "Búho" },
  { query: "flamingo", name: "Flamenco" },
  { query: "penguin", name: "Pingüino" }
];

type CardType = {
  id: number;
  symbol: string;
  imageUrl: string;
  animalName: string;
  matched: boolean;
  flipped: boolean;
};

type Score = {
  userName: string;
  score: number;
  date: string;
};

function getNowDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function MemoryPage() {
  const { session } = useSession();
  const { scores: topScores, loading: loadingScores, error: scoresError, saveScore, refreshScores } = useHybridScores("Memoria", 5);
  
  const [difficulty, setDifficulty] = React.useState("facil");
  const [cards, setCards] = React.useState<CardType[]>([]);
  const [selected, setSelected] = React.useState<CardType[]>([]);
  const [disabled, setDisabled] = React.useState(false);
  const [matches, setMatches] = React.useState(0);
  const [moves, setMoves] = React.useState(0);
  const [timer, setTimer] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(false);
  const [showEnd, setShowEnd] = React.useState(false);
  const [loadingImages, setLoadingImages] = React.useState(true);

  // Obtener configuración de dificultad
  const currentDifficulty = difficultyOptions.find(d => d.value === difficulty) || difficultyOptions[0];
  const columns = currentDifficulty.size;

  // Cargar imágenes de animales desde Unsplash
  const loadAnimalImages = async () => {
    setLoadingImages(true);
    try {
      const selectedAnimals = animalQueries.slice(0, currentDifficulty.pairs);
      
      const imagePromises = selectedAnimals.map(async (animal, index) => {
        const imageUrl = await getAnimalImage(animal.query);
        return {
          id: index,
          symbol: `animal-${index}`,
          imageUrl,
          animalName: animal.name,
          matched: false,
          flipped: false
        };
      });

      const animalCards = await Promise.all(imagePromises);
      
      // Crear pares de cartas
      const cardPairs = animalCards.flatMap(card => [
        { ...card, id: card.id * 2 },
        { ...card, id: card.id * 2 + 1 }
      ]);

      setCards(cardPairs);
    } catch (error) {
      console.error('Error al cargar imágenes:', error);
      toast.error('Error al cargar las imágenes del juego');
    } finally {
      setLoadingImages(false);
    }
  };

  // Timer funcional
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Cargar imágenes cuando cambie la dificultad
  React.useEffect(() => {
    loadAnimalImages();
  }, [difficulty]);

  // Verificar si el juego terminó
  React.useEffect(() => {
    if (matches > 0 && matches === currentDifficulty.pairs) {
      setIsRunning(false);
      setShowEnd(true);
      
      // Guardar puntuación usando el hook híbrido
      const score = calculateScore();
      const userName = session?.user?.nickname || session?.user?.name || "Usuario Invitado";
      const userId = session?.user?.id;
      
      saveScore({
        userId,
        userName,
        game: "Memoria",
        score,
        movimientos: moves,
        tiempo: timer,
        dificultad: difficulty
      });
    }
  }, [matches, currentDifficulty.pairs, session, saveScore, moves, timer, difficulty]);

  // Calcular puntuación
  const calculateScore = () => {
    const baseScore = 1000;
    const timePenalty = timer * 2;
    const movePenalty = moves * 5;
    const difficultyBonus = {
      facil: 0,
      medio: 500,
      dificil: 1000
    }[difficulty] || 0;
    
    return Math.max(0, baseScore - timePenalty - movePenalty + difficultyBonus);
  };

  // Mezclar cartas
  const shuffleCards = () => {
    setCards(prev => {
      const shuffled = [...prev].sort(() => Math.random() - 0.5);
      return shuffled.map(card => ({ ...card, matched: false, flipped: false }));
    });
    setSelected([]);
    setMatches(0);
    setMoves(0);
    setTimer(0);
    setIsRunning(true);
  };

  // Manejar clic en carta
  const handleClick = (card: CardType) => {
    if (disabled || card.matched || card.flipped) return;

    if (!isRunning) setIsRunning(true);

    const newSelected = [...selected, card];
    setSelected(newSelected);

    // Marcar carta como volteada
    setCards(prev => prev.map(c => 
      c.id === card.id ? { ...c, flipped: true } : c
    ));

    if (newSelected.length === 2) {
      setDisabled(true);
      setMoves(prev => prev + 1);

      const [first, second] = newSelected;
      
      if (first.symbol === second.symbol) {
        // Match encontrado
        setCards(prev => prev.map(c => 
          c.id === first.id || c.id === second.id 
            ? { ...c, matched: true, flipped: true }
            : c
        ));
        setMatches(prev => prev + 1);
        setSelected([]);
        setDisabled(false);
        toast.success(`¡Encontraste un par! ${first.animalName}`);
      } else {
        // No hay match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first.id || c.id === second.id 
              ? { ...c, flipped: false }
              : c
          ));
          setSelected([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Título y descripción */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          🧠 Juego de Memoria
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Encuentra los pares de animales en peligro de extinción. 
          ¡Cuanto más rápido y con menos movimientos, mejor puntuación!
        </p>
      </div>

      {/* Panel de control mejorado */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6 shadow-lg">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Configuración de dificultad */}
          <div className="space-y-4 bg-white rounded-lg p-4 shadow-sm">
            <Label className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              🎯 Dificultad
            </Label>
            <ToggleGroup
              type="single"
              value={difficulty}
              onValueChange={(value) => value && setDifficulty(value)}
              className="justify-start"
            >
              {difficultyOptions.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="px-4 py-2 data-[state=on]:bg-blue-600 data-[state=on]:text-white"
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            
            <Button 
              onClick={shuffleCards} 
              disabled={loadingImages}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-md"
            >
              {loadingImages ? '🔄 Cargando...' : '🎮 Nuevo Juego'}
            </Button>
          </div>

          {/* Estadísticas del juego - Reorganizadas */}
          <div className="xl:col-span-2 space-y-4">
            <Label className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              📊 Estadísticas del Juego
            </Label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-500">🔄</span>
                  <p className="text-sm text-gray-600 font-medium">Movimientos</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">{moves}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-500">⏱️</span>
                  <p className="text-sm text-gray-600 font-medium">Tiempo</p>
                </div>
                <p className="text-2xl font-bold text-green-600">{formatTime(timer)}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-500">🎯</span>
                  <p className="text-sm text-gray-600 font-medium">Pares</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">{matches}/{currentDifficulty.pairs}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-orange-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-orange-500">📈</span>
                  <p className="text-sm text-gray-600 font-medium">Progreso</p>
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round((matches / currentDifficulty.pairs) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablero de juego mejorado */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
        <div className="flex justify-center">
          <div
            className="grid gap-2 sm:gap-3 p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl shadow-xl max-w-full overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(60px, 1fr))`,
            }}
          >
            {loadingImages ? (
              // Loading state mejorado
              Array.from({ length: currentDifficulty.pairs * 2 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl animate-pulse shadow-md"
                />
              ))
            ) : (
              // Cards mejoradas
              cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleClick(card)}
                  disabled={disabled || card.matched}
                  className={`relative aspect-square rounded-xl shadow-lg transition-all duration-300 transform ${
                    card.matched
                      ? "opacity-60 cursor-not-allowed scale-95 ring-2 ring-green-400"
                      : card.flipped
                      ? "scale-100 ring-2 ring-blue-400"
                      : "hover:scale-105 hover:shadow-xl hover:ring-2 hover:ring-purple-300"
                  }`}
                >
                  <div className={`w-full h-full rounded-xl overflow-hidden ${
                    card.flipped || card.matched ? 'rotate-y-0' : 'rotate-y-180'
                  } transition-transform duration-500`}>
                    {card.flipped || card.matched ? (
                      <div className="relative w-full h-full">
                        <img
                          src={card.imageUrl}
                          alt={card.animalName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent text-white text-xs p-2 text-center font-medium">
                          {card.animalName}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center relative overflow-hidden">
                        {/* Patrón de fondo sutil */}
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full"></div>
                          <div className="absolute bottom-2 right-2 w-1 h-1 bg-white rounded-full"></div>
                          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                        </div>
                        {/* Icono de tarjeta en lugar del signo de interrogación */}
                        <div className="relative z-10">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <path d="M9 9h6v2H9z"/>
                            <path d="M9 13h6v2H9z"/>
                            <path d="M9 17h6v2H9z"/>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))
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
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                ¡Juego Completado!
              </h2>
              <p className="text-gray-600 text-lg">¡Excelente trabajo! Has encontrado todos los pares.</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 space-y-4 border border-blue-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3 text-center border border-blue-200">
                  <div className="text-blue-500 text-sm font-medium mb-1">Movimientos</div>
                  <div className="text-2xl font-bold text-blue-600">{moves}</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-green-200">
                  <div className="text-green-500 text-sm font-medium mb-1">Tiempo</div>
                  <div className="text-2xl font-bold text-green-600">{formatTime(timer)}</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-purple-200">
                <div className="text-purple-500 text-sm font-medium mb-1">Dificultad</div>
                <div className="text-xl font-bold text-purple-600 capitalize">{difficulty}</div>
              </div>
              <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg p-4 text-center border-2 border-orange-300">
                <div className="text-orange-600 text-sm font-medium mb-2">Puntuación Final</div>
                <div className="text-3xl font-bold text-orange-700">{calculateScore().toLocaleString()}</div>
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
                  shuffleCards();
                }} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-md"
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
