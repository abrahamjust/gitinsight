import PullRequestReview from "../models/pullRequestReview.js";

export {
    create,
    findByGithubId,
    findByRepositoryId,
    createMany,
    findExistingGithubIds,
}

async function create(reviewData) {
    return PullRequestReview.create(reviewData);
}

async function findByGithubId(repositoryId, githubId) {
    return PullRequestReview.findOne({
        repositoryId,
        githubId,
    }).lean();
}

async function findByRepositoryId(repositoryId) {
    return PullRequestReview.find({
        repositoryId,
    }).lean();
}

async function createMany(reviewData) {
    return PullRequestReview.insertMany(reviewData, {
        ordered: false,
    });
}

async function findExistingGithubIds(repositoryId, githubIds) {
    const reviews = await PullRequestReview.find(
    {
        repositoryId,
        githubId: { $in: githubIds },
    },
    {
        githubId: 1,
        _id: 0,
    }
    ).lean();

    return new Set(reviews.map((review) => review.githubId));
}
