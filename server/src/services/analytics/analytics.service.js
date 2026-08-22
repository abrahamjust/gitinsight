import * as commitRepository from "../../repositories/commitRepository.js";
import * as contributorRepository from "../../repositories/contributorRepository.js";
import { calculateActivity } from "./activity/commitAnalytics.js";
// import { connectMongo } from "../../config/database.js";

export {
    generateAnalytics
}

async function generateAnalytics(repositoryId) {
    const commits = await commitRepository.findByRepositoryId(repositoryId);
    const contributors = await contributorRepository.findByRepositoryId(repositoryId);
    const activity = calculateActivity(commits, contributors);

    return {
        repositoryId,
        activity,
        calculatedAt: new Date()
    };
}

// await connectMongo();
// const result = await generateAnalytics(
//     "6a871c315c1413ea1e2de562"
// );

// console.log(result);