import Release from "../models/release.js";
import { bulkUpsert } from "./utils/bulkUpsert.js";

export {
    create,
    findByGithubId,
    findByRepositoryId,
    upsertMany,
    deleteByRepositoryId,
};

async function create(releaseData) {
    return await Release.create(releaseData);
}

async function findByGithubId(repositoryId, githubId) {
    return await Release.findOne({
        repositoryId,
        githubId,
    }).lean();
}

async function findByRepositoryId(repositoryId, projection = null) {
    return await Release.find({
        repositoryId,
    }, projection).lean();
}

// drafts get published and prereleases promoted, so existing ones are refreshed
async function upsertMany(releases) {
    return await bulkUpsert(Release, releases, ["repositoryId", "githubId"]);
}

async function deleteByRepositoryId(repositoryId) {
    return await Release.deleteMany({ repositoryId });
}
