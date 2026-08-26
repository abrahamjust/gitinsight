import app from "./app.js";
import {env} from "./config/env.js";

import { connectMongo, connectRedis } from "./config/database.js";

async function startServer() {
    try {
        await connectMongo(); // to connect to mongodb
        // await connectRedis(); // to connect to redis

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