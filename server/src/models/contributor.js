import mongoose from "mongoose";

const contributorSchema = new mongoose.Schema(
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

        login: {
            type: String,
            required: true,
        },

        name: {
            type: String,
            default: null,
        },

        avatarUrl: {
            type: String,
            default: null,
        },

        profileUrl: {
            type: String,
            default: null,
        },

        contributions: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

contributorSchema.index(
    {
        repositoryId: 1,
        githubId: 1,
    },
    {
        unique: true,
    }
);

const Contributor = mongoose.model(
    "Contributor",
    contributorSchema
);

export default Contributor;