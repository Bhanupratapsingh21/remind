import { Router } from "express";
import { VapiWebhookController } from "../modules/vapi/vapi.webhook";
import { devOnly, verifyVapiSecret } from "../middlewares/vapi-auth.middleware";

const router = Router();

// Vapi Webhook (Vapi server-to-server, authenticated by shared secret header)
router.post("/vapi", verifyVapiSecret, VapiWebhookController.handleWebhook);

// Local simulation endpoint for testing (disabled in production)
router.post("/vapi/simulate", devOnly, VapiWebhookController.simulateCallResult);

export default router;
