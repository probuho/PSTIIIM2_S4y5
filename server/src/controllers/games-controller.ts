import { Request, Response, RequestHandler } from "express";
import { prisma } from "../lib/prisma";


const getTopMemoryScores = async (req: Request, res: Response) => {
  try {
    const scores = await prisma.gameScore.findMany({
      where: { game: "Memoria" },
      orderBy: { score: "desc" },
      take: 5,
    });
    // Adaptar para frontend global: incluir game y date como string
    const result = scores.map(s => ({
      userName: s.userName,
      game: s.game,
      score: s.score,
      date: s.date ? new Date(s.date).toISOString().slice(0, 10) : "",
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los puntajes" });
  }
};

// Nuevo endpoint para guardar puntaje
const saveMemoryScore = async (req: Request, res: Response) => {
  try {
    const { userId, userName, score } = req.body;
    if (!userName || typeof score !== "number") {
      res.status(400).json({ error: "Datos incompletos" });
      return;
    }
    const newScore = await prisma.gameScore.create({
      data: {
        userId: userId || null,
        userName,
        game: "Memoria",
        score,
      },
    });
    res.status(201).json(newScore);
  } catch (error) {
    res.status(500).json({ error: "Error al guardar el puntaje" });
  }
};

export default {
  getTopMemoryScores,
  saveMemoryScore,
};
