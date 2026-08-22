import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
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
            required: true,
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

        labels: [
            {
                name: {
                    type: String,
                    required: true,
                },
            },
        ],

        comments: {
            type: Number,
            default: 0,
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

        url: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

issueSchema.index(
    {
        repositoryId: 1,
        githubId: 1,
    },
    {
        unique: true,
    }
);

const Issue = mongoose.model("Issue", issueSchema);

export default Issue;