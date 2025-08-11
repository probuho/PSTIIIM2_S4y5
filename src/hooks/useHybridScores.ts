import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/components/context/auth-context";
import { API_ENDPOINTS } from "../lib/config";

export type GameScore = {
  id?: string;
  userId?: string;
  userName: string;
  game: string;
  score: number;
  date: string;
  isAuthenticated: boolean;
  source: 'local' | 'database';
};

export type SaveScoreParams = {
  userId?: string;
  userName: string;
  game: string;
  score: number;
  movimientos?: number;
  palabrasCompletadas?: number;
  tiempo: number;
  dificultad: string;
};

export function useHybridScores(game: string, limit = 5) {
  const { session } = useSession();
  const [scores, setScores] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener scores de localStorage (usuarios invitados)
  const getLocalScores = useCallback((): GameScore[] => {
    try {
      const key = `${game.toLowerCase()}-scores`;
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      
      const localScores = JSON.parse(raw);
      return localScores.map((score: any) => ({
        ...score,
        game,
        isAuthenticated: false,
        source: 'local' as const,
        date: score.date || new Date().toISOString()
      }));
    } catch (err) {
      console.error("Error reading local scores:", err);
      return [];
    }
  }, [game]);

  // Función para obtener scores de la base de datos (usuarios autenticados)
  const fetchDatabaseScores = useCallback(async (): Promise<GameScore[]> => {
    try {
      const response = await fetch(API_ENDPOINTS.GAMES_TOP(game) + `?limit=${limit}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data.map((score: any) => ({
          ...score,
          game,
          isAuthenticated: true,
          source: 'database' as const
        }));
      }
      return [];
    } catch (err) {
      console.error("Error fetching database scores:", err);
      return [];
    }
  }, [game, limit]);

  // Función para combinar y ordenar scores
  const combineAndSortScores = useCallback((dbScores: GameScore[], localScores: GameScore[]): GameScore[] => {
    // Combinar todos los scores
    const allScores = [...dbScores, ...localScores];
    
    // Ordenar por puntuación (mayor a menor) y priorizar usuarios autenticados
    return allScores.sort((a, b) => {
      // Primero por autenticación (usuarios autenticados tienen prioridad)
      if (a.isAuthenticated && !b.isAuthenticated) return -1;
      if (!a.isAuthenticated && b.isAuthenticated) return 1;
      
      // Luego por puntuación
      return b.score - a.score;
    }).slice(0, limit);
  }, [limit]);

  // Función para cargar todos los scores
  const fetchAllScores = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Obtener scores de la base de datos
      const dbScores = await fetchDatabaseScores();
      
      // Obtener scores locales
      const localScores = getLocalScores();
      
      // Combinar y ordenar
      const combinedScores = combineAndSortScores(dbScores, localScores);
      
      setScores(combinedScores);
    } catch (err) {
      console.error("Error fetching all scores:", err);
      setError("Error al cargar puntuaciones");
      
      // Si falla la BD, mostrar solo scores locales
      const localScores = getLocalScores();
      setScores(localScores.slice(0, limit));
    } finally {
      setLoading(false);
    }
  }, [fetchDatabaseScores, getLocalScores, combineAndSortScores, limit]);

  // Función para guardar score
  const saveScore = useCallback(async (params: SaveScoreParams): Promise<boolean> => {
    try {
      const scoreData = {
        id: Date.now().toString(),
        userId: params.userId,
        userName: params.userName,
        game: params.game,
        score: params.score,
        date: new Date().toISOString(),
        isAuthenticated: !!params.userId,
        source: params.userId ? 'database' as const : 'local' as const
      };

      if (params.userId) {
        // Usuario autenticado - guardar en base de datos
        const endpoint = game === 'Memoria' 
          ? API_ENDPOINTS.GAMES_MEMORY_SCORE 
          : API_ENDPOINTS.GAMES_CROSSWORD_SCORE;
        
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: params.userId,
            userName: params.userName,
            movimientos: params.movimientos,
            palabrasCompletadas: params.palabrasCompletadas,
            tiempo: params.tiempo,
            dificultad: params.dificultad,
          }),
        });

        if (!response.ok) {
          throw new Error("Error al guardar en base de datos");
        }
      } else {
        // Usuario invitado - guardar en localStorage
        const key = `${game.toLowerCase()}-scores`;
        const existingScores = getLocalScores();
        
        // Verificar si ya existe un score similar para evitar duplicados
        const isDuplicate = existingScores.some(existing => 
          existing.userName === params.userName && 
          existing.score === params.score &&
          Math.abs(new Date(existing.date).getTime() - new Date().getTime()) < 60000 // 1 minuto
        );
        
        if (!isDuplicate) {
          const newScores = [...existingScores, scoreData];
          
          // Mantener solo los últimos 20 scores para no llenar localStorage
          const trimmedScores = newScores.slice(-20);
          localStorage.setItem(key, JSON.stringify(trimmedScores));
        }
      }

      // Actualizar la lista de scores
      await fetchAllScores();
      return true;
    } catch (err) {
      console.error("Error saving score:", err);
      setError("Error al guardar puntuación");
      return false;
    }
  }, [game, getLocalScores, fetchAllScores]);

  // Cargar scores inicialmente
  useEffect(() => {
    fetchAllScores();
  }, [fetchAllScores]);

  // Actualizar automáticamente cada 2 minutos (reducido de 30 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllScores();
    }, 120000); // 2 minutos

    return () => clearInterval(interval);
  }, [fetchAllScores]);

  // Función para refrescar manualmente
  const refreshScores = useCallback(() => {
    fetchAllScores();
  }, [fetchAllScores]);

  return {
    scores,
    loading,
    error,
    saveScore,
    refreshScores,
    isAuthenticated: !!session
  };
}
