import Issue from "../models/issue.js";
import { bulkUpsert } from "./utils/bulkUpsert.js";

export {
    create,
    findByGithubId,
    findByRepositoryId,
    upsertMany,
    deleteByRepositoryId,
};

async function create(issueData) {
    return await Issue.create(issueData);
}

async function findByGithubId(repositoryId, githubId) {
    return await Issue.findOne({
        repositoryId,
        githubId,
    }).lean();
}

async function findByRepositoryId(repositoryId, projection = null) {
    return await Issue.find({
        repositoryId,
    }, projection).lean();
}

// issues get closed, reopened and commented on, so existing ones are refreshed
async function upsertMany(issues) {
    return await bulkUpsert(Issue, issues, ["repositoryId", "githubId"]);
}

async function deleteByRepositoryId(repositoryId) {
    return await Issue.deleteMany({ repositoryId });
}
