import mongoose from "mongoose";

const releaseSchema = new mongoose.Schema(
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

        tagName: {
            type: String,
            required: true,
        },

        name: {
            type: String,
            default: null,
        },

        body: {
            type: String,
            default: null,
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

        draft: {
            type: Boolean,
            default: false,
        },

        prerelease: {
            type: Boolean,
            default: false,
        },

        createdAtGithub: {
            type: Date,
            required: true,
        },

        publishedAtGithub: {
            type: Date,
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

releaseSchema.index(
    {
        repositoryId: 1,
        githubId: 1,
    },
    {
        unique: true,
    }
);

const Release = mongoose.model("Release", releaseSchema);

export default Release;