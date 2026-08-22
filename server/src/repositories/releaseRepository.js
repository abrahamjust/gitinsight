import Release from "../models/release.js";

export {
    create,
    findByGithubId,
    findByRepositoryId,
    createMany,
    findExistingGithubIds,
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

async function findByRepositoryId(repositoryId) {
    return await Release.find({
        repositoryId,
    }).lean();
}

async function createMany(releaseData) {
    return await Release.insertMany(releaseData, {
        ordered: false,
    });
}

async function findExistingGithubIds(repositoryId, githubIds) {
    const releases = await Release.find(
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
        releases.map(release => release.githubId)
    );
}