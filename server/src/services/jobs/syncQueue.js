import { Queue } from "bullmq";
import IORedis from "ioredis";
import { env } from "../../config/env.js";

export {
    syncQueue,
    enqueueRepositorySync,
    getActiveSyncJob,
    removeSyncJob,
};

const connection = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

const syncQueue = new Queue("repository-sync", {
    connection,
});

const ACTIVE_STATES = new Set(["waiting", "active", "delayed", "prioritized", "waiting-children"]);

// one job id per repository, so the queue itself says whether a sync is running
const jobIdFor = (repositoryId) => `sync-${repositoryId}`;

// The queued or running job for a repository, or null. Repository status in
// MongoDB can go stale (worker crash, job lost), the queue is the source of truth.
async function getActiveSyncJob(repositoryId) {
    const job = await syncQueue.getJob(jobIdFor(repositoryId));
    if (!job) return null;

    const state = await job.getState();
    return ACTIVE_STATES.has(state) ? job : null;
}

async function removeSyncJob(repositoryId) {
    const job = await syncQueue.getJob(jobIdFor(repositoryId));
    if (job) {
        await job.remove().catch(() => {
            // an active job is locked by the worker; it finishes on its own
        });
    }
}

async function enqueueRepositorySync(repositoryId, userId) {
    // a finished job with the same id would make BullMQ ignore the new one
    await removeSyncJob(repositoryId);

    return await syncQueue.add(
        "sync-repository",
        {
            repositoryId: String(repositoryId),
            userId: String(userId),
        },
        {
            jobId: jobIdFor(repositoryId),
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
            removeOnComplete: true,
            removeOnFail: { age: 24 * 3600 },
        }
    );
}
