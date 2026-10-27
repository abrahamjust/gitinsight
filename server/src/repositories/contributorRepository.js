import Contributor from "../models/contributor.js";
import { bulkUpsert } from "./utils/bulkUpsert.js";

export {
    create,
    findByGithubId,
    findByRepositoryId,
    upsertMany,
    deleteByRepositoryId,
};

async function create(contributorData) {
    return await Contributor.create(contributorData);
}

async function findByGithubId(repositoryId, githubId) {
    return await Contributor.findOne({
        repositoryId,
        githubId,
    }).lean();
}

async function findByRepositoryId(repositoryId, projection = null) {
    return await Contributor.find({
        repositoryId,
    }, projection).lean();
}

// contribution counts change over time, so existing contributors are refreshed
async function upsertMany(contributors) {
    return await bulkUpsert(Contributor, contributors, ["repositoryId", "githubId"]);
}

async function deleteByRepositoryId(repositoryId) {
    return await Contributor.deleteMany({ repositoryId });
}
