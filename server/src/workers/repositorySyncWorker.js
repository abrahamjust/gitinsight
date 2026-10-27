import { UnrecoverableError, Worker } from "bullmq";
import IORedis from "ioredis";
import { env } from "../config/env.js";

import * as repositoryRepository from "../repositories/repositoryRepository.js";

import { connectMongo, connectRedis } from "../config/database.js";
import { syncRepository } from "../services/repositorySync/repositorySyncService.js";
import { GitHubError, GitHubRateLimitError } from "../services/github/githubClient.js";

const connection = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

await connectMongo();
await connectRedis();

// Retrying in a few seconds can't fix these: the rate limit resets much
// later, and a missing repository or bad token stays that way.
function isPermanent(error) {
    return (
        error instanceof GitHubRateLimitError ||
        (error instanceof GitHubError && !error.retryable && error.status !== null && error.status < 500)
    );
}

async function markFailed(job, message) {
    await repositoryRepository.updateByIdAndUserId(
        job.data.repositoryId,
        job.data.userId,
        {
            analyticsStatus: "failed",
            syncError: message || "Repository synchronization failed"
        }
    );
}

const worker = new Worker(
    "repository-sync",
    async (job) => {
        const { repositoryId, userId } = job.data;

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

        try {
            const result = await syncRepository(repositoryId, userId, {
                onProgress: (progress) => {
                    job.updateProgress(progress).catch(() => {});
                },
            });

            await repositoryRepository.updateByIdAndUserId(
                repositoryId,
                userId,
                {
                    analyticsStatus: "completed",
                    syncError: null
                }
            );

            console.log(
                `Repository sync completed: ${repositoryId}`,
                result.imported
            );

            return result;

        } catch (error) {
            console.error(
                `Repository sync failed: ${repositoryId}`,
                error.message
            );

            if (isPermanent(error)) {
                await markFailed(job, error.message);
                throw new UnrecoverableError(error.message);
            }

            throw error;
        }
    },
    {
        connection,
        // large bulk writes can delay lock renewal; a generous lock keeps
        // long imports from being flagged as stalled and run twice
        lockDuration: 5 * 60 * 1000,
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
        `Sync job ${job.id} failed (attempt ${job.attemptsMade}):`,
        error.message
    );

    if (job.attemptsMade >= (job.opts.attempts ?? 1)) {
        await markFailed(job, error.message);
    }
});

async function shutdown() {
    console.log("Stopping sync worker…");
    await worker.close();
    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("Repository sync worker is running");
