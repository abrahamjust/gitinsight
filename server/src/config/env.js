import dotenv from 'dotenv';

dotenv.config();

export const env = {
    SERVER_PORT: process.env.SERVER_PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    REDIS_URL: process.env.REDIS_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
};
