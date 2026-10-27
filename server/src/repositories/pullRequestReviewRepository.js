import PullRequestReview from "../models/pullRequestReview.js";
import { bulkUpsert } from "./utils/bulkUpsert.js";

export {
    create,
    findByGithubId,
    findByRepositoryId,
    upsertMany,
    deleteByRepositoryId,
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

async function findByRepositoryId(repositoryId, projection = null) {
    return PullRequestReview.find({
        repositoryId,
    }, projection).lean();
}

// reviews can be dismissed after submission, so existing ones are refreshed
async function upsertMany(reviews) {
    return bulkUpsert(PullRequestReview, reviews, ["repositoryId", "githubId"]);
}

async function deleteByRepositoryId(repositoryId) {
    return PullRequestReview.deleteMany({ repositoryId });
}
