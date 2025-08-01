import { useEffect, useState } from "react";

export type GameScore = {
  userName: string;
  game: string;
  score: number;
  date: string;
};

export function useTopScores(game: string, limit = 5) {
  const [scores, setScores] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (game === "Memoria") {
      fetch(`/api/games/memory/top`)
        .then(res => res.json())
        .then(data => {
          // El backend retorna un array de scores
          setScores(
            (Array.isArray(data) ? data : []).map((s: any) => ({
              userName: s.userName,
              game: s.game,
              score: s.score,
              date: s.date || "",
            }))
          );
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      fetch(`/api/games/top-scores?game=${encodeURIComponent(game)}&limit=${limit}`)
        .then(res => res.json())
        .then(data => {
          setScores(data.scores || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [game, limit]);

  return { scores, loading };
} 