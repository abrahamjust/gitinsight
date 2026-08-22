import Contributor from "../models/contributor.js";

export {
    create,
    findByGithubId,
    findByRepositoryId,
    createMany,
    findExistingGithubIds,
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

async function findByRepositoryId(repositoryId) {
    return await Contributor.find({
        repositoryId,
    }).lean();
}

async function createMany(contributorData) {
    return await Contributor.insertMany(contributorData, {
        ordered: false,
    });
}

async function findExistingGithubIds(repositoryId, githubIds) {
    const contributors = await Contributor.find(
        {
            repositoryId,
            githubId: {
                $in: githubIds,
            },
        },
        {
            githubId: 1,
            _id: 0,
        }
    ).lean();

    return new Set(
        contributors.map(contributor => contributor.githubId)
    );
}