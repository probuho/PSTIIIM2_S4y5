
import { Router } from "express";
import { optionalAuth } from "../middleware/optional-auth";
import userController from "../controllers/user-controller";
import { requireAuth } from "../middleware/require-auth";
import gamesRoutes from "./games";


const router = Router();


router.post("/signUp", optionalAuth, userController.register);
router.post("/signIn", optionalAuth, userController.signIn);
router.post("/user/:id", requireAuth, userController.updateUser);
router.post("/refresh-token", userController.refreshToken);

// Rutas de juegos
router.use("/games", gamesRoutes);

export default router;
