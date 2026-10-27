import dotenv from 'dotenv';

dotenv.config();

export const env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    SERVER_PORT: process.env.SERVER_PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    REDIS_URL: process.env.REDIS_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    // newest N commits / PRs / issues / releases kept per sync; 0 disables the cap
    GITHUB_MAX_ITEMS_PER_RESOURCE: Number(process.env.GITHUB_MAX_ITEMS_PER_RESOURCE ?? 5000),
};
