import { Router } from "express";
import { SpeciesController } from "../controllers/species-controller";
import { requireAuth } from "../middleware/require-auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Rutas públicas
router.get("/", asyncHandler(SpeciesController.getAllSpecies));
router.get("/search", asyncHandler(SpeciesController.searchSpecies));
router.get("/featured", asyncHandler(SpeciesController.getFeaturedSpecies));
router.get("/:id", asyncHandler(SpeciesController.getSpeciesById));

// Rutas protegidas (requieren autenticación)
router.post("/", requireAuth, asyncHandler(SpeciesController.createSpecies));
router.put("/:id", requireAuth, asyncHandler(SpeciesController.updateSpecies));
router.delete("/:id", requireAuth, asyncHandler(SpeciesController.deleteSpecies));

export default router; 