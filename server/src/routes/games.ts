import { Router } from "express";
import gamesController from "../controllers/games-controller";

const router = Router();


// GET /api/games/memory/top
router.get("/memory/top", gamesController.getTopMemoryScores);

// POST /api/games/memory/score
router.post("/memory/score", gamesController.saveMemoryScore);

export default router;
