import { Router } from "express";
import { optionalAuth } from "../middleware/optional-auth";
import userController from "../controllers/user-controller";

const router = Router();

router.post("/signUp", optionalAuth, userController.register);
router.post("/signIn", optionalAuth, userController.signIn);

export default router;
