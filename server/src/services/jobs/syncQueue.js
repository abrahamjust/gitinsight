import { Queue } from "bullmq";
import IORedis from "ioredis";
import { env } from "../../config/env.js";

const connection = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

export const syncQueue = new Queue("repository-sync", {
    connection,
});