import mongoose from "mongoose";

const repositorySchema = new mongoose.Schema(
    {
        githubId: {
            type: Number,
            required: true,
            unique: true
        },

        owner: {
            type: String,
            required: true,
            trim: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        fullName: {
            type: String, 
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        url: {
            type: String,
            required: true,
        },

        defaultBranch: {
            type: String,
            default: "main",
        },

        visibility: {
            type: String,
            enum: ["public", "private"],
        },

        language: {
            type: String,
            default: "",
        },

        topics: [{
            type: String,
        }],

        stars: {
            type: Number,
            default: 0,
        },

        forks: {
            type: Number,
            default: 0,
        },

        watchers: {
            type: Number,
            default: 0,
        },

        openIssues: {
            type: Number,
            default: 0,
        },

        createdAtGithub: {
            type: Date,
        },

        updatedAtGithub: {
            type: Date,
        },

        pushedAt: {
            type: Date,
        },

        ownerAvatar: {
            type: String,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        lastSynced: {
            type: Date,
            default: null,
        },

        analyticsStatus: {
            type: String,
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending",
        },

        syncError: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
)

const Repository = mongoose.model("Repository", repositorySchema);

export default Repository;