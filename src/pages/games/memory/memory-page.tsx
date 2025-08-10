import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSession } from "@/components/context/auth-context";
import { useGameScore } from "@/hooks/useGameScore";
import { useTopScores } from "@/hooks/useTopScores";
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
  const { saveMemoryScore, loading: savingScore } = useGameScore();
  const { scores: topScores, loading: loadingScores, error: scoresError } = useTopScores("Memoria", 5);
  
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
      
      // Guardar puntuación
      if (session?.user) {
        const score = calculateScore();
        saveMemoryScore(score, session.user.nickname || session.user.nombre);
      }
    }
  }, [matches, currentDifficulty.pairs, session]);

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

      {/* Panel de control */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuración de dificultad */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-gray-900">Dificultad</Label>
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
                  className="px-4 py-2"
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            
            <Button 
              onClick={shuffleCards} 
              disabled={loadingImages}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700"
            >
              {loadingImages ? 'Cargando...' : 'Nuevo Juego'}
            </Button>
          </div>

          {/* Estadísticas del juego */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-gray-900">Estadísticas</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Movimientos</p>
                <p className="text-2xl font-bold text-blue-600">{moves}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Tiempo</p>
                <p className="text-2xl font-bold text-green-600">{formatTime(timer)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Pares</p>
                <p className="text-2xl font-bold text-purple-600">{matches}/{currentDifficulty.pairs}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Progreso</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round((matches / currentDifficulty.pairs) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablero de juego */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-center">
          <div
            className="grid gap-3 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg max-w-full"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
            }}
          >
            {loadingImages ? (
              // Loading state
              Array.from({ length: currentDifficulty.pairs * 2 }).map((_, index) => (
                <div
                  key={index}
                  className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-gray-200 rounded-xl animate-pulse"
                />
              ))
            ) : (
              // Cards
              cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleClick(card)}
                  disabled={disabled || card.matched}
                  className={`relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-xl shadow-lg transition-all duration-300 transform ${
                    card.matched
                      ? "opacity-50 cursor-not-allowed scale-95"
                      : card.flipped
                      ? "scale-100"
                      : "hover:scale-105"
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
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                          {card.animalName}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-2xl">?</span>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top puntuaciones */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          🏆 Top 5 Puntuaciones
        </h2>
        <div className="bg-gray-50 rounded-lg p-4">
          {loadingScores ? (
            <div className="text-center text-gray-500">Cargando puntuaciones...</div>
          ) : scoresError ? (
            <div className="text-center text-red-500">{scoresError}</div>
          ) : topScores.length === 0 ? (
            <div className="text-center text-gray-500">No hay puntuaciones aún. ¡Sé el primero!</div>
          ) : (
            <div className="space-y-3">
              {topScores.map((score, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      i === 0 ? 'bg-yellow-500' : 
                      i === 1 ? 'bg-gray-400' : 
                      i === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="font-medium text-gray-900">{score.userName}</span>
                  </div>
                  <span className="font-bold text-blue-600 text-lg">{score.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de fin de juego */}
      <Dialog open={showEnd} onOpenChange={setShowEnd}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">🎉 ¡Juego Completado!</h2>
              <p className="text-gray-600">¡Excelente trabajo! Has encontrado todos los pares.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Movimientos:</span>
                <span className="font-bold text-blue-600">{moves}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tiempo:</span>
                <span className="font-bold text-green-600">{formatTime(timer)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dificultad:</span>
                <span className="font-bold text-purple-600 capitalize">{difficulty}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-600">Puntuación:</span>
                <span className="font-bold text-2xl text-orange-600">{calculateScore().toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowEnd(false)} 
                variant="outline" 
                className="flex-1"
              >
                Continuar
              </Button>
              <Button 
                onClick={() => {
                  setShowEnd(false);
                  shuffleCards();
                }} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Jugar de nuevo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
