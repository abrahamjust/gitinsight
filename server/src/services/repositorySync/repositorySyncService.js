import * as githubService from "../github/githubAPI.service.js";
import * as repositoryRepository from "../../repositories/repositoryRepository.js";
import * as commitRepository from "../../repositories/commitRepository.js";
import * as pullRequestRepository from "../../repositories/pullRequestRepository.js";
import * as issueRepository from "../../repositories/issueRepository.js";
import * as contributorRepository from "../../repositories/contributorRepository.js";
import * as releaseRepository from "../../repositories/releaseRepository.js";
import * as pullRequestReviewRepository from "../../repositories/pullRequestReviewRepository.js";
import { deleteCache } from "../cache/redisService.js";

export {
    syncRepository,
    syncCommits,
    syncPullRequests,
    syncIssues,
    syncContributors,
    syncReleases,
};

const withRepository = (repository, items) =>
    items.map(item => ({ ...item, repositoryId: repository._id }));

async function syncCommits(repository, { since = null, onProgress } = {}) {
    const commits = await githubService.getCommits(repository.url, since, { onProgress });
    return await commitRepository.upsertMany(withRepository(repository, commits));
}

// Reviews arrive with their pull requests, so both are written here.
async function syncPullRequests(repository, { since = null, onProgress } = {}) {
    const pullRequests = await githubService.getPullRequests(repository.url, since, { onProgress });

    const prResult = await pullRequestRepository.upsertMany(
        withRepository(repository, pullRequests.map(({ reviews, ...pr }) => pr))
    );

    const prIds = await pullRequestRepository.findIdsByGithubIds(
        repository._id,
        pullRequests.map(pr => pr.githubId)
    );

    const reviews = pullRequests.flatMap(pr =>
        pr.reviews.map(review => ({
            ...review,
            repositoryId: repository._id,
            pullRequestId: prIds.get(pr.githubId),
        }))
    );

    const reviewResult = await pullRequestReviewRepository.upsertMany(reviews);

    return {
        ...prResult,
        reviews: reviewResult,
    };
}

async function syncIssues(repository, { since = null, onProgress } = {}) {
    const issues = await githubService.getIssues(repository.url, since, { onProgress });
    return await issueRepository.upsertMany(withRepository(repository, issues));
}

async function syncContributors(repository, { onProgress } = {}) {
    const contributors = await githubService.getContributors(repository.url, { onProgress });
    return await contributorRepository.upsertMany(withRepository(repository, contributors));
}

async function syncReleases(repository, { onProgress } = {}) {
    const releases = await githubService.getReleases(repository.url, { onProgress });
    return await releaseRepository.upsertMany(withRepository(repository, releases));
}

/**
 * Full or incremental sync. Commits, PRs and issues only fetch what changed
 * since the previous successful sync; contributors and releases are small
 * and refreshed in full. All resources are fetched concurrently.
 *
 * onProgress receives { commits, pullRequests, issues, contributors, releases }
 * with the number of items fetched so far.
 */
async function syncRepository(repositoryId, userId, { onProgress } = {}) {
    const repository = await repositoryRepository.findByIdAndUserId(
        repositoryId,
        userId
    );

    if (!repository) {
        throw new Error("Repository not found");
    }

    const since = repository.lastSynced;
    const syncStartedAt = new Date();

    const repositoryData = await githubService.getRepository(repository.url);

    await repositoryRepository.updateByIdAndUserId(
        repositoryId,
        userId,
        {
            ...repositoryData,
            userId,
        }
    );

    const progress = {
        commits: 0,
        pullRequests: 0,
        issues: 0,
        contributors: 0,
        releases: 0,
    };

    const track = (key) => (count) => {
        progress[key] = count;
        onProgress?.({ ...progress });
    };

    const [commits, pullRequests, issues, contributors, releases] = await Promise.all([
        syncCommits(repository, { since, onProgress: track("commits") }),
        syncPullRequests(repository, { since, onProgress: track("pullRequests") }),
        syncIssues(repository, { since, onProgress: track("issues") }),
        syncContributors(repository, { onProgress: track("contributors") }),
        syncReleases(repository, { onProgress: track("releases") }),
    ]);

    await deleteCache(`analytics:${repositoryId}`);

    await repositoryRepository.updateByIdAndUserId(
        repositoryId,
        userId,
        {
            lastSynced: syncStartedAt,
        }
    );

    return {
        repositoryId,
        imported: {
            commits: commits.inserted,
            pullRequests: pullRequests.inserted,
            reviews: pullRequests.reviews.inserted,
            issues: issues.inserted,
            contributors: contributors.inserted,
            releases: releases.inserted,
        },
    };
}
