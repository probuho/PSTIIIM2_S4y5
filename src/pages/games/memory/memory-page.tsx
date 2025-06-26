import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

type CardType = {
  id: number;
  symbol: string;
  matched: boolean;
};

const symbols = [
  carta1,
  carta2,
  carta3,
  carta4,
  carta5,
  carta6,
  carta7,
  carta8,
  carta9,
  carta10,
];

export default function MemoryPage() {
  const { session } = useSession();
  const [cards, setCards] = React.useState<CardType[]>([]);
  const [selected, setSelected] = React.useState<CardType[]>([]);
  const [disabled, setDisabled] = React.useState(false);
  const [matches, setMatches] = React.useState(0);

  React.useEffect(() => {
    shuffleCards();
  }, []);

  React.useEffect(() => {
    if (matches === symbols.length) {
      toast.success("¡Felicidades! Has completado el juego de memoria.");
      if (session?.user) {
        // Aquí iría la lógica para guardar la puntuación, por ejemplo:
        // await axios.post('http://localhost:3001/score', { userId: session.user.id, score: ... })
      }
    }
  }, [matches, session]);

  const shuffleCards = () => {
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
    const newSelection = [...selected, card];
    setSelected(newSelection);

    if (newSelection.length === 2) {
      setDisabled(true);
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <Label className="text-2xl">Juego de Memoria de Vida Silvestre</Label>
        <Button onClick={shuffleCards}>Reiniciar</Button>
      </div>
      <div className="grid grid-cols-4 gap-4 flex-1">
        {cards.map((card) => {
          const isFlipped = selected.includes(card) || card.matched;
          return (
            <div key={card.id} className="flex justify-center items-center">
              <div
                className={`flex justify-center items-center ${
                  isFlipped
                    ? "flipped bg-accent"
                    : "bg-accent-foreground hover:border-2 hover:border-blue-600"
                } border rounded-md h-35 w-30`}
                onClick={() => handleClick(card)}
              >
                <span className="text-5xl">
                  {isFlipped ? (
                    <img src={card.symbol} className="rounded-md h-35 w-30" />
                  ) : (
                    <img src={reverse} className="rounded-md h-35 w-30" />
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
