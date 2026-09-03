import * as commitRepository from "../../repositories/commitRepository.js";
import * as contributorRepository from "../../repositories/contributorRepository.js";
import * as pullRequestRepository from "../../repositories/pullRequestRepository.js";
import * as issueRepository from "../../repositories/issueRepository.js";
import * as releaseRepository from "../../repositories/releaseRepository.js";
import { calculateActivity } from "./activity/commitAnalytics.js";
import { calculateCollaboration } from "./collaboration/pullRequestAnalytics.js";
import { calculateIssues } from "./issues/issueAnalytics.js";
import { connectMongo } from "../../config/database.js";
import { calculateContributors } from "./contributors/contributorAnalytics.js";
import { calculateReleases } from "./releases/releaseAnalytics.js";

export {
    generateAnalytics
}

async function generateAnalytics(repositoryId) {
    const commits = await commitRepository.findByRepositoryId(repositoryId);
    const contributors = await contributorRepository.findByRepositoryId(repositoryId);
    const pullRequests = await pullRequestRepository.findByRepositoryId(repositoryId);
    const issues = await issueRepository.findByRepositoryId(repositoryId);
    const releases = await releaseRepository.findByRepositoryId(repositoryId);
    
    const activity = calculateActivity(commits, contributors);
    const collaboration = calculateCollaboration(pullRequests);
    const issueAnalytics = calculateIssues(issues);
    const contributorAnalytics = calculateContributors(contributors);
    const releaseAnalytics = calculateReleases(releases);
    
    return {
        repositoryId,
        activity,
        collaboration,
        issues: issueAnalytics,
        contributors: contributorAnalytics,
        releases: releaseAnalytics,
        calculatedAt: new Date()
    };
}

await connectMongo();
const result = await generateAnalytics(
    "6a99052ab26193c70f2e4d52"
);

console.log(result);