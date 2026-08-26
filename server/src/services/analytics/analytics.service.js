import * as commitRepository from "../../repositories/commitRepository.js";
import * as contributorRepository from "../../repositories/contributorRepository.js";
import * as pullRequestRepository from "../../repositories/pullRequestRepository.js";
import { calculateActivity } from "./activity/commitAnalytics.js";
import { calculateCollaboration } from "./collaboration/pullRequestAnalytics.js";
import { connectMongo } from "../../config/database.js";

export {
    generateAnalytics
}

async function generateAnalytics(repositoryId) {
    const commits = await commitRepository.findByRepositoryId(repositoryId);
    const contributors = await contributorRepository.findByRepositoryId(repositoryId);
    const pullRequests = await pullRequestRepository.findByRepositoryId(repositoryId);
    
    const activity = calculateActivity(commits, contributors);
    const collaboration = calculateCollaboration(pullRequests);

    return {
        repositoryId,
        activity,
        collaboration,
        calculatedAt: new Date()
    };
}

await connectMongo();
const result = await generateAnalytics(
    "6a871c315c1413ea1e2de562"
);

console.log(result);