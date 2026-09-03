import { redisClient } from "../../config/database.js";

export { setCache, getCache, deleteCache };

async function setCache(key, value, expirationSeconds = 600) {
    await redisClient.set(
        key, 
        JSON.stringify(value),
        {
            EX: expirationSeconds,
        }
    );
}

async function getCache(key) {
    const value = await redisClient.get(key);

    if (!value) {
        return null;
    }

    return JSON.parse(value);
}

async function deleteCache(key) {
    await redisClient.del(key);
}