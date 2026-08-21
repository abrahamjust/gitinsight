import mongoose from "mongoose";

const pullRequestSchema = new mongoose.Schema(
    {
        repositoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Repository",
            required: true,
        },

        githubId: {
            type: Number,
            required: true,
        },

        number: {
            type: Number,
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        body: {
            type: String,
            default: null,
        },

        state: {
            type: String,
            enum: ["open", "closed"],
            required: true,
        },

        author: {
            login: {
                type: String,
                default: null,
            },

            avatarUrl: {
                type: String,
                default: null,
            },
        },

        createdAtGithub: {
            type: Date,
            required: true,
        },

        updatedAtGithub: {
            type: Date,
            required: true,
        },

        closedAt: {
            type: Date,
            default: null,
        },

        mergedAt: {
            type: Date,
            default: null,
        },

        url: {
            type: String,
            required: true,
        },

        additions: {
            type: Number,
            default: 0,
        },

        deletions: {
            type: Number,
            default: 0,
        },

        changedFiles: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

pullRequestSchema.index(
    {
        repositoryId: 1,
        githubId: 1
    },
    {
        unique: true,
    }
);

const pullRequest = mongoose.model(
    "PullRequest",
    pullRequestSchema
);

export default pullRequest;