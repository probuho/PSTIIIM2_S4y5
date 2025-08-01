import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Función para calcular puntuación basada en movimientos, tiempo y dificultad
const calcularPuntuacion = (movimientos: number, tiempo: number, dificultad: string): number => {
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

// Obtener top scores para un juego específico
const getTopScores = async (req: Request, res: Response) => {
  try {
    const { game } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const scores = await prisma.gameScore.findMany({
      where: { game },
      orderBy: { score: "desc" },
      take: limit,
      select: {
        userName: true,
        score: true,
        date: true,
        game: true
      }
    });

    res.json({
      success: true,
      data: scores.map(score => ({
        ...score,
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
const saveMemoryScore = async (req: Request, res: Response) => {
  try {
    const { userId, userName, movimientos, tiempo, dificultad } = req.body;
    
    if (!userName || typeof movimientos !== "number" || typeof tiempo !== "number" || !dificultad) {
      return res.status(400).json({ 
        success: false, 
        error: "Datos incompletos o inválidos" 
      });
    }

    // Calcular puntuación
    const puntuacion = calcularPuntuacion(movimientos, tiempo, dificultad);

    const newScore = await prisma.gameScore.create({
      data: {
        userId: userId || null,
        userName,
        game: "Memoria",
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
const saveCrosswordScore = async (req: Request, res: Response) => {
  try {
    const { userId, userName, palabrasCompletadas, tiempo, dificultad } = req.body;
    
    if (!userName || typeof palabrasCompletadas !== "number" || typeof tiempo !== "number" || !dificultad) {
      return res.status(400).json({ 
        success: false, 
        error: "Datos incompletos o inválidos" 
      });
    }

    // Para crucigrama, usamos palabras completadas como "movimientos"
    const puntuacion = calcularPuntuacion(palabrasCompletadas, tiempo, dificultad);

    const newScore = await prisma.gameScore.create({
      data: {
        userId: userId || null,
        userName,
        game: "Crucigrama",
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
const getUserScores = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { game } = req.query;

    const whereClause: any = { userId };
    if (game) {
      whereClause.game = game;
    }

    const scores = await prisma.gameScore.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
      select: {
        game: true,
        score: true,
        date: true
      }
    });

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
const getGameStats = async (req: Request, res: Response) => {
  try {
    const stats = await prisma.gameScore.groupBy({
      by: ['game'],
      _count: {
        id: true
      },
      _avg: {
        score: true
      },
      _max: {
        score: true
      }
    });

    res.json({
      success: true,
      data: stats.map(stat => ({
        game: stat.game,
        totalJugadas: stat._count.id,
        puntuacionPromedio: Math.round(stat._avg.score || 0),
        puntuacionMaxima: stat._max.score || 0
      }))
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ 
      success: false, 
      error: "Error al obtener estadísticas" 
    });
  }
};

export default {
  getTopScores,
  saveMemoryScore,
  saveCrosswordScore,
  getUserScores,
  getGameStats,
  calcularPuntuacion // Exportamos la función para uso en tests
};
