import { Router } from "express";
import { VapiWebhookController } from "../modules/vapi/vapi.webhook";

const router = Router();

// Vapi Webhook (unauthenticated / Vapi server-to-server)
router.post("/vapi", VapiWebhookController.handleWebhook);

// Local simulation endpoint for testing
router.post("/vapi/simulate", VapiWebhookController.simulateCallResult);

export default router;
