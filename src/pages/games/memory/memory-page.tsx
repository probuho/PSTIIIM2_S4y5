import React from "react";
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
import { toast } from "sonner";

// Tipos y símbolos
const allSymbols = [
  carta1, carta2, carta3, carta4, carta5, carta6, carta7, carta8, carta9, carta10
];

const difficultyOptions = [
  { value: "easy", label: "Fácil", size: 4 },
  { value: "normal", label: "Normal", size: 6 },
  { value: "hard", label: "Difícil", size: 8 },
];

type CardType = {
  id: number;
  symbol: string;
  matched: boolean;
};

type Score = {
  date: string;
  moves: number;
  time: string;
  difficulty: string;
  user: string;
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
  const [difficulty, setDifficulty] = React.useState("easy");
  const [cards, setCards] = React.useState<CardType[]>([]);
  const [selected, setSelected] = React.useState<CardType[]>([]);
  const [disabled, setDisabled] = React.useState(false);
  const [matches, setMatches] = React.useState(0);
  const [autoFit, setAutoFit] = React.useState(true);
  const [moves, setMoves] = React.useState(0);
  const [timer, setTimer] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(false);
  const [showEnd, setShowEnd] = React.useState(false);
  const [scores, setScores] = React.useState<Score[]>([]);

  // Lógica de dificultad
  const getSymbolsForDifficulty = () => {
    if (difficulty === "easy") return allSymbols.slice(0, 8); // 8 pares
    if (difficulty === "normal") return allSymbols.slice(0, 9); // 9 pares (18 cartas)
    if (difficulty === "hard") return allSymbols.slice(0, 10); // 10 pares (20 cartas)
    return allSymbols.slice(0, 8);
  };

  const getBoardSize = () => {
    if (difficulty === "easy") return 4;
    if (difficulty === "normal") return 6;
    if (difficulty === "hard") return 8;
    return 4;
  };

  // Cargar historial de puntuaciones desde localStorage/sessionStorage
  React.useEffect(() => {
    const key = "memory-scores";
    const raw = window.localStorage.getItem(key);
    if (raw) {
      setScores(JSON.parse(raw));
    }
  }, []);

  // Guardar historial de puntuaciones en localStorage/sessionStorage
  const saveScores = (newScores: Score[]) => {
    setScores(newScores);
    window.localStorage.setItem("memory-scores", JSON.stringify(newScores));
  };

  // Timer funcional
  React.useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  React.useEffect(() => {
    shuffleCards();
    setMoves(0);
    setTimer(0);
    setIsRunning(false);
    setShowEnd(false);
  }, [difficulty]);

  React.useEffect(() => {
    if (matches === getSymbolsForDifficulty().length) {
      setIsRunning(false);
      setShowEnd(true);
      // Guardar puntuación
      const user = session?.user?.nickname || "Anónimo";
      const newScore: Score = {
        date: getNowDate(),
        moves,
        time: formatTime(timer),
        difficulty: difficultyOptions.find((d) => d.value === difficulty)?.label || difficulty,
        user,
      };
      const newScores = [newScore, ...scores].slice(0, 10); // Máximo 10 registros
      saveScores(newScores);
      toast.success("¡Felicidades! Has completado el juego de memoria.");
    }
    // eslint-disable-next-line
  }, [matches]);

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
              variant={difficulty === opt.value ? "outline" : "default"}
              size="lg"
              className="flex-1 py-4 px-0 rounded-xl text-base shadow-sm border-2 data-[state=on]:border-blue-600 data-[state=on]:bg-blue-50"
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
          <Label className="text-md mb-2">Historial de Puntuaciones</Label>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Mov.</TableHead>
                <TableHead>Tiempo</TableHead>
                <TableHead>Dificultad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.map((score, i) => (
                <TableRow key={i}>
                  <TableCell>{score.date}</TableCell>
                  <TableCell>{score.user}</TableCell>
                  <TableCell>{score.moves}</TableCell>
                  <TableCell>{score.time}</TableCell>
                  <TableCell>{score.difficulty}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Tablero y controles */}
      <div className="flex-1 flex flex-col items-center justify-start md:justify-center w-full h-full">
        <div className="flex items-center justify-between w-full max-w-5xl mb-4">
          <Label className="text-2xl">Juego de Memoria de Vida Silvestre</Label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={autoFit}
                onChange={() => setAutoFit((v) => !v)}
                className="accent-blue-600"
              />
              Ajustar tablero automáticamente
            </label>
            <Button onClick={shuffleCards}>Reiniciar</Button>
          </div>
        </div>
        <div
          className={`grid bg-white/90 rounded-2xl shadow-lg p-6 gap-6 w-full max-w-5xl mx-auto h-full ${
            autoFit ? "" : "min-h-[600px]"
          }`}
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            height: autoFit ? "100%" : undefined,
            alignContent: "center",
            justifyContent: "center",
          }}
        >
          {cards.map((card) => {
            const isFlipped = selected.includes(card) || card.matched;
            return (
              <div key={card.id} className="flex items-center justify-center w-full h-full">
                <div
                  className={`flex items-center justify-center transition-all duration-300 cursor-pointer select-none bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden aspect-square ${
                    isFlipped ? "ring-2 ring-blue-400" : "hover:ring-2 hover:ring-blue-200"
                  }`}
                  style={{ width: "100%", height: "100%", maxWidth: 120, maxHeight: 120 }}
                  onClick={() => handleClick(card)}
                >
                  {isFlipped ? (
                    <img src={card.symbol} className="object-contain w-5/6 h-5/6" />
                  ) : (
                    <img src={reverse} className="object-contain w-5/6 h-5/6" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Modal de fin de partida */}
        {showEnd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-6 items-center animate-in fade-in">
              <h2 className="text-3xl font-bold text-center">¡Juego Terminado!</h2>
              <div className="w-full bg-slate-50 rounded-xl p-4 flex flex-col items-center">
                <span className="font-semibold text-lg mb-2">Tu Puntuación</span>
                <div className="flex justify-center gap-12 text-xl">
                  <div>
                    Movimientos:<br />
                    <span className="font-bold text-blue-700 text-3xl">{moves}</span>
                  </div>
                  <div>
                    Tiempo:<br />
                    <span className="font-bold text-blue-700 text-3xl">{formatTime(timer)}</span>
                  </div>
                </div>
              </div>
              <div className="w-full bg-slate-50 rounded-xl p-4">
                <span className="font-semibold text-lg block mb-2">Historial de Puntuaciones</span>
                <div className="flex flex-col gap-2">
                  {scores.map((score, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 text-sm shadow border">
                      <span className="text-xs text-muted-foreground w-24">{score.date}</span>
                      <span className="flex-1">Movimientos: <b>{score.moves}</b>, Tiempo: <b>{score.time}</b>, Dificultad: <b>{score.difficulty}</b></span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full bg-slate-50 rounded-xl p-4 flex flex-col gap-3 items-center">
                <span className="font-semibold text-lg">Selecciona Dificultad</span>
                <ToggleGroup
                  type="single"
                  value={difficulty}
                  onValueChange={(v) => v && setDifficulty(v)}
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
              <Button className="w-full mt-2 text-lg py-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold" onClick={() => { setShowEnd(false); shuffleCards(); setMoves(0); setTimer(0); setIsRunning(false); }}>Jugar de Nuevo</Button>
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
