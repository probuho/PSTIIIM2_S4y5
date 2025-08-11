import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Función para calcular puntuación basada en movimientos, tiempo y dificultad
export const calcularPuntuacion = (movimientos: number, tiempo: number, dificultad: string): number => {
  // Factores de puntuación
  const factorMovimientos = 1000; // Puntos base por movimiento eficiente
  const factorTiempo = 50; // Puntos por segundo ahorrado
  const factorDificultad = {
    "facil": 1,
    "medio": 1.5,
    "dificil": 2
  };

  // Cálculo base
  let puntuacion = factorMovimientos / (movimientos + 1); // +1 para evitar división por cero
  
  // Bonus por tiempo (menos tiempo = más puntos)
  const tiempoBase = dificultad === "facil" ? 60 : dificultad === "medio" ? 120 : 180;
  const tiempoBonus = Math.max(0, tiempoBase - tiempo) * factorTiempo;
  puntuacion += tiempoBonus;
  
  // Multiplicador por dificultad
  puntuacion *= factorDificultad[dificultad as keyof typeof factorDificultad] || 1;
  
  return Math.round(puntuacion);
};

// Mapeo de nombres de juegos en español a inglés
const GAME_NAME_MAPPING: { [key: string]: string } = {
  'memoria': 'memory',
  'crucigrama': 'crossword',
  'quiz': 'quiz',
  'adivina': 'guess',
  'ahorcado': 'hangman'
};

// Obtener top scores para un juego específico
export const getTopScores = async (req: Request, res: Response): Promise<void> => {
  try {
    const { game } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    // Convertir el nombre del juego a minúsculas y mapear a inglés
    const gameKey = game.toLowerCase();
    const dbGameName = GAME_NAME_MAPPING[gameKey] || gameKey;

    const scores = await prisma.gameScore.findMany({
      where: { game: dbGameName },
      orderBy: { score: "desc" },
      take: limit,
      select: {
        userName: true,
        score: true,
        date: true,
        movimientos: true,
        tiempo: true,
        dificultad: true,
        palabrasCompletadas: true
      }
    });

    res.json({
      success: true,
      data: scores.map(score => ({
        ...score,
        game: game, // Incluir el nombre del juego en español
        date: score.date.toISOString().slice(0, 10)
      }))
    });
  } catch (error) {
    console.error("Error al obtener top scores:", error);
    res.status(500).json({ 
      success: false, 
      error: "Error al obtener los puntajes" 
    });
  }
};

// Guardar puntuación de memoria
export const saveMemoryScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, userName, movimientos, tiempo, dificultad } = req.body;
    
    if (!userName || typeof movimientos !== "number" || typeof tiempo !== "number" || !dificultad) {
      res.status(400).json({ 
        success: false, 
        error: "Datos incompletos o inválidos" 
      });
      return;
    }

    // Calcular puntuación
    const puntuacion = calcularPuntuacion(movimientos, tiempo, dificultad);

    const newScore = await prisma.gameScore.create({
      data: {
        id: `${userId || 'guest'}-${Date.now()}`,
        userId: userId || null,
        userName,
        game: 'memory',
        movimientos,
        tiempo,
        dificultad,
        score: puntuacion,
      },
    });

    res.status(201).json({
      success: true,
      message: "Puntuación guardada exitosamente",
      data: {
        ...newScore,
        puntuacionCalculada: puntuacion,
        movimientos,
        tiempo,
        dificultad
      }
    });
  } catch (error) {
    console.error("Error al guardar puntuación de memoria:", error);
    res.status(500).json({ 
      success: false, 
      error: "Error al guardar el puntaje" 
    });
  }
};

// Guardar puntuación de crucigrama
export const saveCrosswordScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, userName, palabrasCompletadas, tiempo, dificultad } = req.body;
    
    if (!userName || typeof palabrasCompletadas !== "number" || typeof tiempo !== "number" || !dificultad) {
      res.status(400).json({ 
        success: false, 
        error: "Datos incompletos o inválidos" 
      });
      return;
    }

    // Para crucigrama, usamos palabras completadas como "movimientos"
    const puntuacion = calcularPuntuacion(palabrasCompletadas, tiempo, dificultad);

    const newScore = await prisma.gameScore.create({
      data: {
        id: `${userId || 'guest'}-${Date.now()}`,
        userId: userId || null,
        userName,
        game: 'crossword',
        palabrasCompletadas,
        tiempo,
        dificultad,
        score: puntuacion,
      },
    });

    res.status(201).json({
      success: true,
      message: "Puntuación guardada exitosamente",
      data: {
        ...newScore,
        puntuacionCalculada: puntuacion,
        palabrasCompletadas,
        tiempo,
        dificultad
      }
    });
  } catch (error) {
    console.error("Error al guardar puntuación de crucigrama:", error);
    res.status(500).json({ 
      success: false, 
      error: "Error al guardar el puntaje" 
    });
  }
};

// Obtener puntuaciones de un usuario específico
export const getUserScores = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { game } = req.query;

    let scores: any[] = [];

    if (!game || game === 'memoria') {
      const memoryScores = await prisma.gameScore.findMany({
        where: { 
          userId,
          game: 'memory' // Usar el nombre en inglés directamente
        },
        orderBy: { date: "desc" },
        select: {
          score: true,
          date: true,
          movimientos: true,
          tiempo: true,
          dificultad: true
        }
      });
      scores.push(...memoryScores.map(score => ({
        ...score,
        game: 'Memoria',
        date: score.date
      })));
    }

    if (!game || game === 'crucigrama') {
      const crosswordScores = await prisma.gameScore.findMany({
        where: { 
          userId,
          game: 'crossword' // Usar el nombre en inglés directamente
        },
        orderBy: { date: "desc" },
        select: {
          score: true,
          date: true,
          palabrasCompletadas: true,
          tiempo: true,
          dificultad: true
        }
      });
      scores.push(...crosswordScores.map(score => ({
        ...score,
        game: 'Crucigrama',
        date: score.date
      })));
    }

    if (!game || game === 'ahorcado') {
      const hangmanScores = await prisma.gameScore.findMany({
        where: { 
          userId,
          game: 'hangman' // Usar el nombre en inglés directamente
        },
        orderBy: { date: "desc" },
        select: {
          score: true,
          date: true,
          tiempo: true,
          dificultad: true
        }
      });
      scores.push(...hangmanScores.map(score => ({
        ...score,
        game: 'Ahorcado',
        date: score.date
      })));
    }

    // Ordenar por fecha
    scores.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({
      success: true,
      data: scores.map(score => ({
        ...score,
        date: score.date.toISOString().slice(0, 10)
      }))
    });
  } catch (error) {
    console.error("Error al obtener puntuaciones del usuario:", error);
    res.status(500).json({ 
      success: false, 
      error: "Error al obtener las puntuaciones" 
    });
  }
};

// Obtener estadísticas generales de juegos
export const getGameStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtener estadísticas de memoria
    const memoryStats = await prisma.gameScore.aggregate({
      _count: { id: true },
      _avg: { score: true },
      _max: { score: true }
    });

    // Obtener estadísticas de crucigrama
    const crosswordStats = await prisma.gameScore.aggregate({
      _count: { id: true },
      _avg: { score: true },
      _max: { score: true }
    });

    const stats = [
      {
        game: 'Memoria',
        totalJugadas: memoryStats._count.id,
        puntuacionPromedio: Math.round(memoryStats._avg.score || 0),
        puntuacionMaxima: memoryStats._max.score || 0
      },
      {
        game: 'Crucigrama',
        totalJugadas: crosswordStats._count.id,
        puntuacionPromedio: Math.round(crosswordStats._avg.score || 0),
        puntuacionMaxima: crosswordStats._max.score || 0
      }
    ];

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ 
      success: false, 
      error: "Error al obtener estadísticas" 
    });
  }
};
