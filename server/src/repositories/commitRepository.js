import Commit from "../models/commit.js";

export {
    create,
    findBySha,
    findByRepositoryId,
    createMany,
    findExistingShas,
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

async function findByRepositoryId(repositoryId) {
    return await Commit.find({
        repositoryId,
    }).lean();
}

async function createMany(commitData) {
    return await Commit.insertMany(commitData, {
        ordered: false,
    });
}

async function findExistingShas(repositoryId, shas) {
    const commits = await Commit.find(
        {
            repositoryId,
            sha: { $in: shas },
        },
        {
            sha: 1,
            _id: 0,
        }
    ).lean();

    return new Set(commits.map(commit => commit.sha));
}