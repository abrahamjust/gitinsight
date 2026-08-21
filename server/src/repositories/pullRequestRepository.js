import PullRequest from "../models/pullRequest.js";

export {
    create,
    findByGithubId,
    findByRepositoryId,
    createMany,
    findExistingGithubIds,
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

async function findByRepositoryId(repositoryId) {
    return await PullRequest.find({
        repositoryId,
    }).lean();
}

async function createMany(pullRequestData) {
    return await PullRequest.insertMany(pullRequestData, {
        ordered: false,
    });
}

async function findExistingGithubIds(repositoryId, githubIds) {
    const pullRequests = await PullRequest.find(
        {
            repositoryId,
            githubId: { $in: githubIds },
        },
        {
            githubId: 1,
            _id: 0,
        }
    ).lean();

    return new Set(
        pullRequests.map(pullRequest => pullRequest.githubId)
    );
}