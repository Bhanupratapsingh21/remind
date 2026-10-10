import Redis, { RedisOptions } from "ioredis";
import { ENV } from "./env";

const redisOptions: RedisOptions = ENV.REDIS_URL
  ? { maxRetriesPerRequest: null }
  : {
      host: ENV.REDIS_HOST,
      port: ENV.REDIS_PORT,
      password: ENV.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null, // BullMQ requires maxRetriesPerRequest to be null
      enableReadyCheck: false,
    };

export const createRedisConnection = () => {
  const client = ENV.REDIS_URL
    ? new Redis(ENV.REDIS_URL, { maxRetriesPerRequest: null })
    : new Redis(redisOptions);

  client.on("error", (err) => {
    console.error("❌ Redis error:", err.message);
  });

  client.on("connect", () => {
    console.log("⚡ Connected to Redis successfully");
  });

  return client;
};

export const redisClient = createRedisConnection();
export default redisClient;
