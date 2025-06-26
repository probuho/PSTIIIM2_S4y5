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
    fetch(`/api/games/top-scores?game=${encodeURIComponent(game)}&limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        setScores(data.scores || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [game, limit]);

  return { scores, loading };
} 