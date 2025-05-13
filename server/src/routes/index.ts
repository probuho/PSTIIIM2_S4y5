import { Router } from "express";
import { optionalAuth } from "../middleware/optional-auth";
import userController from "../controllers/user-controller";
import { requireAuth } from "@/middleware/require-auth";

const router = Router();

router.post("/signUp", optionalAuth, userController.register);
router.post("/signIn", optionalAuth, userController.signIn);
router.post("/user/:id", requireAuth, userController.updateUser);

export default router;
