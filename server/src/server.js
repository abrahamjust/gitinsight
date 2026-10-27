import app from "./app.js";
import {env} from "./config/env.js";

import { connectMongo, connectRedis } from "./config/database.js";
import Repository from "./models/repository.js";

async function startServer() {
    try {
        await connectMongo(); // to connect to mongodb
        await connectRedis(); // to connect to redis

        // Drops the old globally unique githubId index in favour of the
        // per-user { userId, githubId } one. A no-op once indexes match.
        await Repository.syncIndexes();

        app.listen(env.SERVER_PORT, (error) => {

            if (error) {
                throw error;
            }

            console.log(`Server is running on port ${env.SERVER_PORT}`);
        });
    } catch (err) {
        console.error("Error starting server:", err);
        process.exit(1);
    }
}

startServer();
