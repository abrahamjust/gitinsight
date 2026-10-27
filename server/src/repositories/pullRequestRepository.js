import PullRequest from "../models/pullRequest.js";
import { bulkUpsert } from "./utils/bulkUpsert.js";

export {
    create,
    findByGithubId,
    findByRepositoryId,
    findIdsByGithubIds,
    upsertMany,
    deleteByRepositoryId,
};

async function create(pullRequestData) {
    return await PullRequest.create(pullRequestData);
}

async function findByGithubId(repositoryId, githubId) {
    return await PullRequest.findOne({
        repositoryId,
        githubId,
    }).lean();
}

async function findByRepositoryId(repositoryId, projection = null) {
    return await PullRequest.find({
        repositoryId,
    }, projection).lean();
}

// githubId -> MongoDB _id, used to link reviews to their pull request
async function findIdsByGithubIds(repositoryId, githubIds) {
    const pullRequests = await PullRequest.find(
        {
            repositoryId,
            githubId: { $in: githubIds },
        },
        {
            githubId: 1,
        }
    ).lean();

    return new Map(
        pullRequests.map(pullRequest => [pullRequest.githubId, pullRequest._id])
    );
}

// PRs get merged, closed and edited, so existing ones are refreshed
async function upsertMany(pullRequests) {
    return await bulkUpsert(PullRequest, pullRequests, ["repositoryId", "githubId"]);
}

async function deleteByRepositoryId(repositoryId) {
    return await PullRequest.deleteMany({ repositoryId });
}
