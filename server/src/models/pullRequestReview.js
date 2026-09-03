import mongoose from "mongoose";

const pullRequestReviewSchema = new mongoose.Schema(
    {
        repositoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Repository",
            required: true,
        },

        pullRequestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PullRequest",
            required: true,
        },

        githubId: {
            type: Number,
            required: true,
        },

        reviewer: {
            login: {
                type: String,
                default: null,
            },
            avatarUrl: {
                type: String,
                default: null,
            },
        },

        state: {
            type: String,
            enum: ["APPROVED", "CHANGES_REQUESTED", "COMMENTED", "DISMISSED"],
            required: true,
        },

        submittedAt: {
            type: Date,
            required: true,
        },

        body: {
            type: String,
            default: null,
        },

        url: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

pullRequestReviewSchema.index(
    { repositoryId: 1, githubId: 1 },
    { unique: true }
);

const PullRequestReview = mongoose.model(
    "PullRequestReview",
    pullRequestReviewSchema
);

export default PullRequestReview;