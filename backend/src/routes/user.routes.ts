import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { UserController } from "../modules/users/user.controller";

const router = Router();

router.use(authenticate as any);

router.get("/settings", UserController.getSettings as any);
router.patch("/settings", UserController.updateSettings as any);

export default router;
