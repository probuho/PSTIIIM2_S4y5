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

  // Función para cargar los scores
  const fetchScores = async () => {
    try {
      setError(null);
      const response = await fetch(API_ENDPOINTS.GAMES_TOP(game) + `?limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        setScores(data.data || []);
      } else {
        setError(data.error || "Error al cargar puntuaciones");
      }
    } catch (err) {
      console.error("Error fetching top scores:", err);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // Cargar scores inicialmente
  useEffect(() => {
    setLoading(true);
    fetchScores();
  }, [game, limit]);

  // Actualizar automáticamente cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchScores();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [game, limit]);

  // Función para refrescar manualmente
  const refreshScores = () => {
    setLoading(true);
    fetchScores();
  };

  return { 
    scores, 
    loading, 
    error, 
    refreshScores // Función para refrescar manualmente
  };
} 