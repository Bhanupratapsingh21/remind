import createApp from "./app";
import { ENV } from "./config/env";
import prisma from "./config/db";
import { redisClient } from "./config/redis";
import { startReminderWorker, stopReminderWorker } from "./workers/reminder.worker";
import { SchedulerService } from "./queues/reminder.queue";
import { VapiService } from "./modules/vapi/vapi.service";

const app = createApp();

// Start the BullMQ Reminder Worker
startReminderWorker();

// Periodically resolve calls whose end-of-call webhook never arrived
SchedulerService.scheduleCallReconciliation().catch((err) =>
  console.error("❌ Could not register call reconciliation job:", err.message)
);

// Confirm the Vapi phone number (and its telephony provider) before the first call
VapiService.verifyPhoneNumber();

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
