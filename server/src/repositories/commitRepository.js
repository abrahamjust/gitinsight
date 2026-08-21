import Commit from "../models/commit.js";

export {
    create,
    findBySha,
    findByRepositoryId,
    createMany,
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