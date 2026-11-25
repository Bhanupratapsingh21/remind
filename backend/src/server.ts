import createApp from "./app";
import { BillingService } from "./modules/billing/billing.service";
import { ENV, getProductionConfigErrors } from "./config/env";
import prisma from "./config/db";
import { redisClient } from "./config/redis";
import { startReminderWorker, stopReminderWorker } from "./workers/reminder.worker";
import { SchedulerService } from "./queues/reminder.queue";
import { VapiService } from "./modules/vapi/vapi.service";

// Refuse to boot a production server whose config cannot place or track calls
if (ENV.NODE_ENV === "production") {
  const configErrors = getProductionConfigErrors();
  if (configErrors.length) {
    console.error("❌ Production config is incomplete. Fix these env vars and restart:");
    configErrors.forEach((e) => console.error(`   - ${e}`));
    process.exit(1);
  }
} else {
  getProductionConfigErrors().forEach((e) => console.warn(`⚠️  [Config, would block production] ${e}`));
}

const app = createApp();

// Start the BullMQ Reminder Worker
startReminderWorker();

// Periodically resolve calls whose end-of-call webhook never arrived
SchedulerService.scheduleCallReconciliation().catch((err) =>
  console.error("❌ Could not register call reconciliation job:", err.message)
);

// Confirm the Vapi key, phone number (and its telephony provider) and assistant before the first call
VapiService.verifySetup();
BillingService.verifySetup().catch((error) => console.error("❌ [Billing] Setup check crashed:", error));

const server = app.listen(ENV.PORT, () => {
  console.log(`\n=================================================`);
  console.log(`🚀 Remind Backend API running on port: ${ENV.PORT}`);
  console.log(`📡 Health check:   http://localhost:${ENV.PORT}/health`);
  console.log(`🔐 Auth API:       http://localhost:${ENV.PORT}/api/auth`);
  console.log(`⏰ Reminders API:  http://localhost:${ENV.PORT}/api/reminders`);
  console.log(`⚙️  User Settings:  http://localhost:${ENV.PORT}/api/users/settings`);
  console.log(`📥 Vapi Webhook:   http://localhost:${ENV.PORT}/api/webhooks/vapi`);
  console.log(`💻 Client URL:     ${ENV.CLIENT_URL}`);
  console.log(`🎭 Vapi Mode:      ${ENV.VAPI_MOCK_CALLS ? "SIMULATION / MOCK" : "PRODUCTION (LIVE VAPI)"}`);
  console.log(`=================================================\n`);
});

const handleGracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await stopReminderWorker();
      await prisma.$disconnect();
      redisClient.disconnect();
      console.log("🔌 All connections closed gracefully.");
    } catch (e) {
      console.error("Error during graceful shutdown:", e);
    }
    process.exit(0);
  });
};

process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
