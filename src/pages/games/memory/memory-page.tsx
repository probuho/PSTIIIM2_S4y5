import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import carta1 from "@/assets/cartas/carta_1.webp";
import carta2 from "@/assets/cartas/carta_2.webp";
import carta3 from "@/assets/cartas/carta_3.webp";
import carta4 from "@/assets/cartas/carta_4.webp";
import carta5 from "@/assets/cartas/carta_5.webp";
import carta6 from "@/assets/cartas/carta_6.webp";
import carta7 from "@/assets/cartas/carta_7.webp";
import carta8 from "@/assets/cartas/carta_8.webp";
import carta9 from "@/assets/cartas/carta_9.webp";
import carta10 from "@/assets/cartas/carta_10.webp";
import reverse from "@/assets/cartas/carta_reverso.webp";
import { useSession } from "@/components/context/auth-context";
import { useGameScore } from "@/hooks/useGameScore";
import { useTopScores } from "@/hooks/useTopScores";
import { toast } from "sonner";

// Tipos y símbolos
const allSymbols = [
  carta1, carta2, carta3, carta4, carta5, carta6, carta7, carta8, carta9, carta10
];

const difficultyOptions = [
  { value: "facil", label: "Fácil", size: 4 },
  { value: "medio", label: "Normal", size: 6 },
  { value: "dificil", label: "Difícil", size: 8 },
];

type CardType = {
  id: number;
  symbol: string;
  matched: boolean;
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
  const [autoFit, setAutoFit] = React.useState(true);
  const [moves, setMoves] = React.useState(0);
  const [timer, setTimer] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(false);
  const [showEnd, setShowEnd] = React.useState(false);

  // Lógica de dificultad
  const getSymbolsForDifficulty = () => {
    if (difficulty === "facil") return allSymbols.slice(0, 8); // 8 pares
    if (difficulty === "medio") return allSymbols.slice(0, 9); // 9 pares (18 cartas)
    if (difficulty === "dificil") return allSymbols.slice(0, 10); // 10 pares (20 cartas)
    return allSymbols.slice(0, 8);
  };

  const getBoardSize = () => {
    if (difficulty === "facil") return 4;
    if (difficulty === "medio") return 6;
    if (difficulty === "dificil") return 8;
    return 4;
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

  // Verificar si el juego terminó
  React.useEffect(() => {
    if (matches > 0 && matches === getSymbolsForDifficulty().length) {
      setIsRunning(false);
      setShowEnd(true);
      
      // Guardar puntaje usando la nueva API
      const saveScore = async () => {
        try {
          const userName = session?.user?.nickname || "Anónimo";
          const userId = session?.user?.id || undefined;
          
          await saveMemoryScore({
            userId,
            userName,
            movimientos: moves,
            tiempo: timer,
            dificultad: difficulty,
          });
          
          toast.success("¡Felicidades! Has completado el juego de memoria.");
        } catch (error) {
          console.error("Error al guardar puntuación:", error);
          toast.error("Error al guardar la puntuación");
        }
      };
      
      saveScore();
    }
  }, [matches, moves, timer, difficulty, session, saveMemoryScore]);

  const shuffleCards = () => {
    const symbols = getSymbolsForDifficulty();
    const duplicated = [...symbols, ...symbols];
    const shuffled = duplicated
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        matched: false,
      }));
    setCards(shuffled);
    setSelected([]);
    setMatches(0);
    setMoves(0);
    setTimer(0);
    setIsRunning(false);
    setShowEnd(false);
  };

  const handleClick = (card: CardType) => {
    if (disabled || selected.some((c) => c.id === card.id)) return;
    if (!isRunning && moves === 0) setIsRunning(true);
    const newSelection = [...selected, card];
    setSelected(newSelection);
    if (newSelection.length === 2) {
      setDisabled(true);
      setMoves((m) => m + 1);
      setTimeout(() => {
        const [first, second] = newSelection;
        if (first.symbol === second.symbol) {
          setCards((prev) =>
            prev.map((c) =>
              c.symbol === first.symbol ? { ...c, matched: true } : c
            )
          );
          setMatches((prev) => prev + 1);
        }
        setSelected([]);
        setDisabled(false);
      }, 1000);
    }
  };

  // Calcular columnas y filas dinámicamente
  const totalCards = cards.length;
  let columns = getBoardSize();
  let rows = Math.ceil(totalCards / columns);
  if (autoFit) {
    columns = Math.ceil(Math.sqrt(totalCards));
    rows = Math.ceil(totalCards / columns);
  }

  return (
    <div className="flex flex-col md:flex-row gap-10 w-full h-[calc(100vh-64px)] p-6 max-w-[1600px] mx-auto">
      {/* Panel lateral */}
      <div className="w-full md:w-[340px] bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col gap-6 mb-4 md:mb-0">
        <Label className="text-lg mb-2">Dificultad</Label>
        <ToggleGroup
          type="single"
          value={difficulty}
          onValueChange={(v) => v && setDifficulty(v)}
          className="w-full gap-4 mb-2"
        >
          {difficultyOptions.map((opt) => (
            <ToggleGroupItem
              key={opt.value}
              value={opt.value}
              className={`flex-1 py-4 px-0 rounded-xl text-base shadow-sm border-2 ${difficulty === opt.value ? "border-blue-600 bg-blue-50" : ""}`}
            >
              {opt.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div>
          <Label className="text-md">Puntuación Actual</Label>
          <div className="flex justify-between mt-2 text-sm">
            <span>Movimientos: <span className="font-bold text-blue-700">{moves}</span></span>
            <span>Tiempo: <span className="font-bold text-blue-700">{formatTime(timer)}</span></span>
          </div>
        </div>
        <div>
          <Label className="text-md">Progreso</Label>
          <div className="flex justify-between mt-2 text-sm">
            <span>Pares encontrados: <span className="font-bold text-green-700">{matches}</span></span>
            <span>Total: <span className="font-bold text-gray-700">{getSymbolsForDifficulty().length}</span></span>
          </div>
        </div>
        <Button onClick={shuffleCards} className="w-full py-3">
          Nuevo Juego
        </Button>
        
        {/* Top 5 puntuaciones */}
        <div className="mt-4">
          <Label className="text-md mb-2">Top 5 Puntuaciones</Label>
          <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
            {loadingScores ? (
              <div className="text-center text-sm text-gray-500">Cargando...</div>
            ) : scoresError ? (
              <div className="text-center text-sm text-red-500">{scoresError}</div>
            ) : topScores.length === 0 ? (
              <div className="text-center text-sm text-gray-500">No hay puntuaciones aún</div>
            ) : (
              <div className="space-y-2">
                {topScores.map((score, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="font-medium">{score.userName}</span>
                    <span className="font-bold text-blue-700">{score.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tablero de juego */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          className="grid gap-2 p-4 bg-white/90 rounded-2xl shadow-lg"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleClick(card)}
              disabled={disabled || card.matched}
              className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl shadow-md transition-all duration-300 ${
                card.matched
                  ? "opacity-50 cursor-not-allowed"
                  : selected.some((c) => c.id === card.id)
                  ? "scale-95"
                  : "hover:scale-105"
              }`}
              style={{
                backgroundImage: `url(${
                  card.matched || selected.some((c) => c.id === card.id)
                    ? card.symbol
                    : reverse
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          ))}
        </div>
      </div>

      {/* Modal de fin de juego */}
      <Dialog open={showEnd} onOpenChange={setShowEnd}>
        <DialogContent>
          <div className="text-center">
            <Label className="text-2xl font-bold mb-4">¡Juego Completado!</Label>
            <div className="space-y-2 mb-6">
              <p>Movimientos: <span className="font-bold">{moves}</span></p>
              <p>Tiempo: <span className="font-bold">{formatTime(timer)}</span></p>
              <p>Dificultad: <span className="font-bold capitalize">{difficulty}</span></p>
            </div>
            <Button onClick={() => setShowEnd(false)} className="w-full">
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
