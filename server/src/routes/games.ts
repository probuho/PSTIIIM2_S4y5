import { Router } from "express";
import {
  getTopScores,
  saveMemoryScore,
  saveCrosswordScore,
  getUserScores,
  getGameStats
} from "../controllers/games-controller";

const router = Router();

// GET /api/games/top/:game - Obtener top scores por juego
router.get("/top/:game", getTopScores);

// GET /api/games/stats - Obtener estadísticas generales
router.get("/stats", getGameStats);

// GET /api/games/user/:userId - Obtener puntuaciones de un usuario
router.get("/user/:userId", getUserScores);

// POST /api/games/memory/score - Guardar puntuación de memoria
router.post("/memory/score", saveMemoryScore);

// POST /api/games/crossword/score - Guardar puntuación de crucigrama
router.post("/crossword/score", saveCrosswordScore);

export default router;
