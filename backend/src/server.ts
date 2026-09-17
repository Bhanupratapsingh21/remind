import createApp from "./app";
import { ENV } from "./config/env";
import prisma from "./config/db";

const app = createApp();

const server = app.listen(ENV.PORT, () => {
  console.log(`\n=================================================`);
  console.log(`🚀 Remind Backend API running on port: ${ENV.PORT}`);
  console.log(`📡 Health check: http://localhost:${ENV.PORT}/health`);
  console.log(`🔐 Auth API:    http://localhost:${ENV.PORT}/api/auth`);
  console.log(`💻 Client URL:   ${ENV.CLIENT_URL}`);
  console.log(`=================================================\n`);
});

const handleGracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log("🔌 MongoDB connection closed.");
    } catch (e) {
      console.error("Error disconnecting MongoDB:", e);
    }
    process.exit(0);
  });
};

process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
