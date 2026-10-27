import Commit from "../models/commit.js";
import { bulkUpsert } from "./utils/bulkUpsert.js";

export {
    create,
    findBySha,
    findByRepositoryId,
    upsertMany,
    deleteByRepositoryId,
};

async function create(commitData) {
    return await Commit.create(commitData);
}

async function findBySha(repositoryId, sha) {
    return await Commit.findOne({
        repositoryId,
        sha,
    });
}

async function findByRepositoryId(repositoryId, projection = null) {
    return await Commit.find({
        repositoryId,
    }, projection).lean();
}

// commits never change once pushed, so existing ones are skipped
async function upsertMany(commits) {
    return await bulkUpsert(Commit, commits, ["repositoryId", "sha"], {
        insertOnly: true,
    });
}

async function deleteByRepositoryId(repositoryId) {
    return await Commit.deleteMany({ repositoryId });
}
