import { Router } from "express";
import { optionalAuth } from "../middleware/optional-auth";
import userController from "../controllers/user-controller";
import { requireAuth } from "../middleware/require-auth";
import {
  getTemasComunidad,
  crearTema,
  responderTema,
  votarTema
} from "../controllers/community-controller";

const router = Router();

router.post("/signUp", optionalAuth, userController.register);
router.post("/signIn", optionalAuth, userController.signIn);
router.post("/user/:id", requireAuth, userController.updateUser);
router.post("/refresh-token", userController.refreshToken);
router.get("/user/profile", requireAuth, userController.getProfile);
router.get("/user/roadmap", requireAuth, userController.getRoadmap);
router.get("/community/temas", getTemasComunidad);
router.post("/community/temas", requireAuth, crearTema);
router.post("/community/temas/:id/responder", requireAuth, responderTema);
router.post("/community/temas/:id/votar", requireAuth, votarTema);

export default router;
