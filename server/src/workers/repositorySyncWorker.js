import { Worker } from "bullmq";
import IORedis from "ioredis";
import { env } from "../config/env.js";

import * as repositoryRepository from "../repositories/repositoryRepository.js";

import { connectMongo, connectRedis } from "../config/database.js";
import { syncRepository } from "../services/repositorySync/repositorySyncService.js";

const connection = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

await connectMongo();
await connectRedis();

const worker = new Worker(
    "repository-sync",
    async (job) => {
        const { repositoryId, userId } = job.data;

        try {
            await repositoryRepository.updateByIdAndUserId(
                repositoryId,
                userId,
                {
                    analyticsStatus: "processing"
                }
            );

            console.log(
                `Starting repository sync: ${repositoryId}`
            );

            const result = await syncRepository(
                repositoryId,
                userId
            );

            await repositoryRepository.updateByIdAndUserId(
                repositoryId,
                userId,
                {
                    analyticsStatus: "completed",
                    syncError: null
                }
            );

            console.log(
                `Repository sync completed: ${repositoryId}`
            );

            return result;

        } catch (error) {

            console.error(
                `Repository sync failed: ${repositoryId}`,
                error
            );

            throw error;
        }
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

worker.on("failed", async (job, error) => {
    if (!job) return;

    console.error(
        `Sync job ${job.id} failed:`,
        error
    );

    if (job.attemptsMade >= job.opts.attempts) {
        await repositoryRepository.updateByIdAndUserId(
            job.data.repositoryId,
            job.data.userId,
            {
                analyticsStatus: "failed",
                syncError: error.message || "Repository synchronization failed"
            }
        );
    }
});

console.log("Repository sync worker is running");