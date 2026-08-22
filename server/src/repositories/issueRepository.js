import Issue from "../models/issue.js";

export {
    create,
    findByGithubId,
    findByRepositoryId,
    createMany,
    findExistingGithubIds,
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

async function findByRepositoryId(repositoryId) {
    return await Issue.find({
        repositoryId,
    }).lean();
}

async function createMany(issueData) {
    return await Issue.insertMany(issueData, {
        ordered: false,
    });
}

async function findExistingGithubIds(repositoryId, githubIds) {
    const issues = await Issue.find(
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
        issues.map(issue => issue.githubId)
    );
}