import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../lib/config";

export type GameScore = {
  userName: string;
  game: string;
  score: number;
  date: string;
};

export function useTopScores(game: string, limit = 5) {
  const [scores, setScores] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetch(API_ENDPOINTS.GAMES_TOP(game) + `?limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setScores(data.data || []);
        } else {
          setError(data.error || "Error al cargar puntuaciones");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching top scores:", err);
        setError("Error de conexión");
        setLoading(false);
      });
  }, [game, limit]);

  return { scores, loading, error };
} 