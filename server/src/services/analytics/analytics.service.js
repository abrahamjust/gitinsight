import * as commitRepository from "../../repositories/commitRepository.js";
import * as contributorRepository from "../../repositories/contributorRepository.js";
import * as pullRequestRepository from "../../repositories/pullRequestRepository.js";
import * as issueRepository from "../../repositories/issueRepository.js";
import * as releaseRepository from "../../repositories/releaseRepository.js";
import * as pullRequestReviewRepository from "../../repositories/pullRequestReviewRepository.js";

import { calculateActivity } from "./activity/commitAnalytics.js";
import { calculateCollaboration } from "./collaboration/pullRequestAnalytics.js";
import { calculateIssues } from "./issues/issueAnalytics.js";
import { connectMongo } from "../../config/database.js";
import { calculateContributors } from "./contributors/contributorAnalytics.js";
import { calculateReleases } from "./releases/releaseAnalytics.js";
import { calculatePRReviewAnalytics } from "./collaboration/pullRequestReviewAnalytics.js";

import { calculateRepositoryHealth } from "../health/healthEngine.js";
import { detectRepositoryBottlenecks } from "../bottlenecks/bottleneckEngine.js";
import { buildAIContext } from "../ai/aiContextBuilder.js";
import { generateRepositoryExplanation } from "../ai/aiExplanationService.js";

export {
    generateAnalytics
}

async function generateAnalytics(repositoryId) {
    const commits = await commitRepository.findByRepositoryId(repositoryId);
    const contributors = await contributorRepository.findByRepositoryId(repositoryId);
    const pullRequests = await pullRequestRepository.findByRepositoryId(repositoryId);
    const issues = await issueRepository.findByRepositoryId(repositoryId);
    const releases = await releaseRepository.findByRepositoryId(repositoryId);
    const reviews = await pullRequestReviewRepository.findByRepositoryId(repositoryId);
    
    const activity = calculateActivity(commits, contributors);
    const collaboration = calculateCollaboration(pullRequests);
    const issueAnalytics = calculateIssues(issues);
    const contributorAnalytics = calculateContributors(contributors);
    const releaseAnalytics = calculateReleases(releases);
    const prReviewAnalytics = calculatePRReviewAnalytics(pullRequests, reviews);
    
    const analytics = {
        repositoryId,
        activity,
        collaboration,
        issues: issueAnalytics,
        contributors: contributorAnalytics,
        releases: releaseAnalytics,
        pullRequestReviews: prReviewAnalytics,
        calculatedAt: new Date()
    };

    const health = calculateRepositoryHealth(analytics);

    const bottlenecks = detectRepositoryBottlenecks(analytics, health);

    const aiContext = buildAIContext(analytics, health, bottlenecks);
    
    const aiExplanation = await generateRepositoryExplanation(aiContext);

    return {
        ...analytics,
        health,
        bottlenecks,
        aiContext,
        aiExplanation,
    };
}

await connectMongo();
const result = await generateAnalytics(
    "6a99052ab26193c70f2e4d52"
);

console.dir(result, { depth: null });