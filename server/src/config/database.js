import { env } from "./env.js";
import mongoose from "mongoose";
import { createClient } from "redis";

export async function connectMongo() {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log("connected to mongodb");
    } catch (error) {
        console.error("MongoDB connection failed");
        console.error(error);

        process.exit(1);
    }
}

export const redisClient = createClient({
    url: env.REDIS_URL,
});

redisClient.on("error", (error) => {
    console.error("Redis error: ", error);
});

redisClient.on("connect", () => {
    console.log("Connected to Redis");
});

redisClient.on("ready", () => {
    console.log("Redis is ready");
});

export async function connectRedis() {
    await redisClient.connect();
}