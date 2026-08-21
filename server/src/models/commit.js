import mongoose from "mongoose";

const commitSchema = new mongoose.Schema(
    {
        repositoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Repository",
            required: true,
        },
        
        sha: {
            type: String,
            required: true,
        }, 

        message: {
            type: String,
            required: true,
        },

        author: {
            login: {
                type: String,
                default: null,
            },
            name: {
                type: String,
                default: null,
            },
            email: {
                type: String,
                default: null,
            },
            avatarUrl: {
                type: String,
                default: null,
            },
        },

        committedAt: {
            type: Date,
            required: true,
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

commitSchema.index(
    {
        repositoryId: 1,
        sha: 1
    },
    {
        unique: true
    }
);

const Commit = mongoose.model("Commit", commitSchema);

export default Commit;