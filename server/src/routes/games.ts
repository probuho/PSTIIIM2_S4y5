import { Router } from "express";
import gamesController from "../controllers/games-controller";

const router = Router();

// GET /api/games/top/:game - Obtener top scores por juego
router.get("/top/:game", gamesController.getTopScores);

// GET /api/games/stats - Obtener estadísticas generales
router.get("/stats", gamesController.getGameStats);

// GET /api/games/user/:userId - Obtener puntuaciones de un usuario
router.get("/user/:userId", gamesController.getUserScores);

// POST /api/games/memory/score - Guardar puntuación de memoria
router.post("/memory/score", gamesController.saveMemoryScore);

// POST /api/games/crossword/score - Guardar puntuación de crucigrama
router.post("/crossword/score", gamesController.saveCrosswordScore);

export default router;
