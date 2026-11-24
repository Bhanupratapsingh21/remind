import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { BillingController } from "../modules/billing/billing.controller";

const router = Router();

router.use(authenticate as any);
router.post("/checkout", BillingController.checkout as any);
router.post("/cancel", BillingController.cancel as any);

export default router;
