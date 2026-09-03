import { Worker } from "bullmq";
import IORedis from "ioredis";
import { env } from "../config/env.js";

import { connectMongo } from "../config/database.js";
import { syncRepository } from "../services/repositorySync/repositorySyncService.js";

const connection = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

await connectMongo();

const worker = new Worker(
    "repository-sync",
    async (job) => {
        const { repositoryId, userId } = job.data;

        console.log(
            `Starting repository sync: ${repositoryId}`
        );

        const result = await syncRepository(
            repositoryId,
            userId
        );

        console.log(
            `Repository sync completed: ${repositoryId}`
        );

        return result;
    },
    {
        connection,
    }
);

worker.on("completed", (job) => {
    console.log(
        `Sync job ${job.id} completed successfully`
    );
});

worker.on("failed", (job, error) => {
    console.error(
        `Sync job ${job?.id} failed:`,
        error
    );
});

console.log("Repository sync worker is running");