import * as githubService from "../services/github/githubAPI.service.js";
import * as repositoryRepository from "../repositories/repositoryRepository.js";
import * as commitRepository from "../repositories/commitRepository.js";
import * as pullRequestRepository from "../repositories/pullRequestRepository.js";
import * as issueRepository from "../repositories/issueRepository.js";
import * as contributorRepository from "../repositories/contributorRepository.js";
import * as releaseRepository from "../repositories/releaseRepository.js";
import * as pullRequestReviewRepository from "../repositories/pullRequestReviewRepository.js";
import * as syncService from "../services/repositorySync/repositorySyncService.js";

import { GitHubError, GitHubRateLimitError } from "../services/github/githubClient.js";
import { enqueueRepositorySync, getActiveSyncJob, removeSyncJob } from "../services/jobs/syncQueue.js";
import { deleteCache } from "../services/cache/redisService.js";

export {
    handleImportRepository,
    getRepositoryData,
    getRepositoryById,
    deleteRepositoryById,
    updateRepositoryById,
    importCommits,
    importPullRequests,
    importIssues,
    importContributors,
    importReleases,
    importPullRequestReviews,
    getSyncStatus
};

// All routes here sit behind requireAuth, so req.user is always set.

function sendGitHubError(res, error, fallbackMessage) {
    if (error instanceof GitHubRateLimitError) {
        return res.status(429).json({
            message: error.message,
            resetAt: error.resetAt,
        });
    }

    if (error instanceof GitHubError && error.status && error.status < 500) {
        return res.status(error.status).json({
            message: error.message,
        });
    }

    console.error(error);
    return res.status(500).json({
        message: fallbackMessage,
    });
}

async function handleImportRepository (req, res) {
    const { url } = req.body ?? {};
    if (!url) {
        return res.status(400).json({
            message: "Repository URL is required",
        });
    }

    try {
        const repositoryData = await githubService.getRepository(url);
        repositoryData.userId = req.user._id;

        const existingRepository = await repositoryRepository.findByGithubIdAndUserId(
            repositoryData.githubId,
            req.user._id
        );
        if (existingRepository) {
            return res.status(409).json({
                message: "Repository already imported",
                repository: existingRepository,
            });
        }

        const repository = await repositoryRepository.create(repositoryData);

        // new repositories start as "pending": queue the initial sync now
        await enqueueRepositorySync(repository._id, req.user._id);

        return res.status(201).json({
            message: "Repository imported successfully",
            repository,
        });
    } catch (error) {
        return sendGitHubError(res, error, "Failed to import repository");
    }
}

async function getRepositoryData (req, res) {
    const repositories = await repositoryRepository.findByUserId(req.user._id);
    return res.status(200).json({
        message: "Repositories of user retrieved successfully",
        repositories,
    });
}

async function getRepositoryById (req, res) {
    const repository = await repositoryRepository.findByIdAndUserId(req.params.id, req.user._id);

    if (!repository) {
        return res.status(404).json({
            message: "Repository not found",
        });
    }

    return res.status(200).json({
        message: "Repository successfully retrieved by repo id",
        repository,
    });
}

async function deleteRepositoryById (req, res) {
    const repoId = req.params.id;
    const deletedRepo = await repositoryRepository.deleteByIdAndUserId(repoId, req.user._id);

    if (!deletedRepo) {
        return res.status(404).json({
            message: "Repository was not present",
        });
    }

    // everything imported for the repository goes with it
    await Promise.all([
        commitRepository.deleteByRepositoryId(deletedRepo._id),
        pullRequestRepository.deleteByRepositoryId(deletedRepo._id),
        pullRequestReviewRepository.deleteByRepositoryId(deletedRepo._id),
        issueRepository.deleteByRepositoryId(deletedRepo._id),
        contributorRepository.deleteByRepositoryId(deletedRepo._id),
        releaseRepository.deleteByRepositoryId(deletedRepo._id),
        removeSyncJob(repoId),
        deleteCache(`analytics:${repoId}`),
    ]);

    return res.status(200).json({
        message: "Repository successfully deleted by repo id",
        deletedRepo,
    });
}

async function updateRepositoryById(req, res) {
    const userId = req.user._id;
    const repoId = req.params.id;

    const existingRepository = await repositoryRepository.findByIdAndUserId(repoId, userId);

    if (!existingRepository) {
        return res.status(404).json({
            message: "Repository not found",
        });
    }

    // Ask the queue rather than analyticsStatus, which stays "pending" or
    // "processing" forever if a job was lost or the worker died mid-sync.
    const activeJob = await getActiveSyncJob(repoId);
    if (activeJob) {
        return res.status(409).json({
            message: "Repository synchronization is already in progress",
            status: existingRepository.analyticsStatus,
        });
    }

    await repositoryRepository.updateByIdAndUserId(repoId, userId, {
        analyticsStatus: "pending",
        syncError: null
    });

    const job = await enqueueRepositorySync(repoId, userId);

    return res.status(202).json({
        message: "Repository synchronization started",
        jobId: job.id,
        status: "pending",
    });
}

/**
 * Synchronous single-resource import (the background sync does all of them).
 * pickResult maps the sync result to { inserted, updated }.
 */
function importResource(label, sync, pickResult = (result) => result) {
    return async function (req, res) {
        const repoId = req.params.id;
        const repository = await repositoryRepository.findByIdAndUserId(repoId, req.user._id);

        if (!repository) {
            return res.status(404).json({
                message: "Repository not found",
            });
        }

        try {
            const { inserted, updated } = pickResult(await sync(repository));
            await deleteCache(`analytics:${repoId}`);

            return res.status(200).json({
                message: `${label} imported successfully`,
                imported: inserted,
                updated,
            });
        } catch (error) {
            return sendGitHubError(res, error, `Failed to import ${label.toLowerCase()}`);
        }
    };
}

const importCommits = importResource("Commits", syncService.syncCommits);
const importPullRequests = importResource("Pull requests", syncService.syncPullRequests);
const importIssues = importResource("Issues", syncService.syncIssues);
const importContributors = importResource("Contributors", syncService.syncContributors);
const importReleases = importResource("Releases", syncService.syncReleases);
// reviews are fetched together with their pull requests
const importPullRequestReviews = importResource(
    "Pull request reviews",
    syncService.syncPullRequests,
    (result) => result.reviews
);

async function getSyncStatus(req, res) {
    const repository = await repositoryRepository.findByIdAndUserId(req.params.id, req.user._id);

    if (!repository) {
        return res.status(404).json({
            message: "Repository not found",
        });
    }

    const job = await getActiveSyncJob(repository._id);
    const progress = job && typeof job.progress === "object" ? job.progress : null;

    let { analyticsStatus: status, syncError } = repository;

    // says it's syncing but nothing is queued: the job was lost
    // (e.g. Redis flushed, or a repository imported before jobs were queued)
    if ((status === "pending" || status === "processing") && !job) {
        status = "failed";
        syncError = "The sync was interrupted. Start it again.";
        await repositoryRepository.updateByIdAndUserId(repository._id, req.user._id, {
            analyticsStatus: status,
            syncError,
        });
    }

    return res.status(200).json({
        repositoryId: repository._id,
        status,
        lastSynced: repository.lastSynced,
        syncError,
        progress,
    });
}
