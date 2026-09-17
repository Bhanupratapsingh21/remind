import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Public Authentication Routes
router.post("/send-otp", AuthController.sendOtp);
router.post("/verify-otp", AuthController.verifyOtp);
router.get("/check-username", AuthController.checkUsername);
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);

// Protected Authentication Routes
router.post("/onboard", authenticate as any, AuthController.onboard as any);
router.get("/me", authenticate as any, AuthController.getMe as any);

export default router;
