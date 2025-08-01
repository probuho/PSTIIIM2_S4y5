import { useState } from "react";
import { API_ENDPOINTS } from "../lib/config";

export type SaveScoreParams = {
  userId?: string;
  userName: string;
  movimientos?: number;
  palabrasCompletadas?: number;
  tiempo: number;
  dificultad: string;
};

export function useGameScore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveMemoryScore = async (params: SaveScoreParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.GAMES_MEMORY_SCORE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: params.userId,
          userName: params.userName,
          movimientos: params.movimientos,
          tiempo: params.tiempo,
          dificultad: params.dificultad,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar puntuación");
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveCrosswordScore = async (params: SaveScoreParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.GAMES_CROSSWORD_SCORE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: params.userId,
          userName: params.userName,
          palabrasCompletadas: params.palabrasCompletadas,
          tiempo: params.tiempo,
          dificultad: params.dificultad,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar puntuación");
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    saveMemoryScore,
    saveCrosswordScore,
    loading,
    error,
  };
} 