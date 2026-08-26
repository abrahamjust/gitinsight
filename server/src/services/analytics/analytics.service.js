import * as commitRepository from "../../repositories/commitRepository.js";
import * as contributorRepository from "../../repositories/contributorRepository.js";
import * as pullRequestRepository from "../../repositories/pullRequestRepository.js";
import * as issueRepository from "../../repositories/issueRepository.js";
import { calculateActivity } from "./activity/commitAnalytics.js";
import { calculateCollaboration } from "./collaboration/pullRequestAnalytics.js";
import { calculateIssues } from "./issues/issueAnalytics.js";
import { connectMongo } from "../../config/database.js";

export {
    generateAnalytics
}

async function generateAnalytics(repositoryId) {
    const commits = await commitRepository.findByRepositoryId(repositoryId);
    const contributors = await contributorRepository.findByRepositoryId(repositoryId);
    const pullRequests = await pullRequestRepository.findByRepositoryId(repositoryId);
    const issues = await issueRepository.findByRepositoryId(repositoryId);

    const activity = calculateActivity(commits, contributors);
    const collaboration = calculateCollaboration(pullRequests);
    const issueAnalytics = calculateIssues(issues);

    return {
        repositoryId,
        activity,
        collaboration,
        issues: issueAnalytics,
        calculatedAt: new Date()
    };
}

await connectMongo();
const result = await generateAnalytics(
    "6a8ed02a9c7914340dea29b6"
);

console.log(result);