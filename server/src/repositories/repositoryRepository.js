import Repository from "../models/repository.js";

export { 
    create,
    findByGithubId,
    findByUserId,
    updateByGithubId,
    deleteByGithubId,
    findByFullName,
    findByIdAndUserId,
    deleteByIdAndUserId,
    updateByIdAndUserId
};

async function create(repositoryData) {
    return await Repository.create(repositoryData);
}

async function findByGithubId(githubId) {
    return await Repository.findOne({ githubId }).lean();
}

async function findByUserId(userId) {
    return await Repository.find({ userId }).lean();
}

async function updateByGithubId(githubId, updateData) {
    return await Repository.findOneAndUpdate(
        { githubId },
        updateData,
        { 
            new: true,
            runValidators: true,
        }
    );
}

async function deleteByGithubId(githubId) {
    return await Repository.findOneAndDelete({ githubId });
}

async function findByFullName(fullName) {
    return await Repository.findOne({ fullName }).lean();
}

async function findByIdAndUserId(id, userId) {
    return await Repository.findOne({
        _id: id,
        userId: userId
    });
}

async function deleteByIdAndUserId(id, userId) {
    return await Repository.findOneAndDelete({
        _id: id,
        userId: userId
    })
}

async function updateByIdAndUserId(id, userId, updateData) {
    return await Repository.findOneAndUpdate(
        {
            _id: id,
            userId: userId,
        },
        updateData,
        {
            new: true,
            runValidators: true,
        }
    );
}