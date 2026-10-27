import * as commitRepository from "../../repositories/commitRepository.js";
import * as contributorRepository from "../../repositories/contributorRepository.js";
import * as pullRequestRepository from "../../repositories/pullRequestRepository.js";
import * as issueRepository from "../../repositories/issueRepository.js";
import * as releaseRepository from "../../repositories/releaseRepository.js";
import * as pullRequestReviewRepository from "../../repositories/pullRequestReviewRepository.js";

import { calculateActivity } from "./activity/commitAnalytics.js";
import { calculateCollaboration } from "./collaboration/pullRequestAnalytics.js";
import { calculateIssues } from "./issues/issueAnalytics.js";
import { calculateContributors } from "./contributors/contributorAnalytics.js";
import { calculateReleases } from "./releases/releaseAnalytics.js";
import { calculatePRReviewAnalytics } from "./collaboration/pullRequestReviewAnalytics.js";

import { calculateRepositoryHealth } from "../health/healthEngine.js";
import { detectRepositoryBottlenecks } from "../bottlenecks/bottleneckEngine.js";
import { buildAIContext } from "../ai/aiContextBuilder.js";
import { generateRepositoryExplanation } from "../ai/aiExplanationService.js";

import { getCache, setCache } from "../cache/redisService.js";

export {
    generateAnalytics
}

const CACHE_SECONDS = 600;
// without an AI explanation, cache briefly so it's retried soon
const CACHE_SECONDS_WITHOUT_AI = 60;

// only the fields the calculators read; skips commit messages, bodies, etc.
const PROJECTIONS = {
    commits: { committedAt: 1, "author.login": 1 },
    contributors: { login: 1, contributions: 1 },
    pullRequests: { state: 1, createdAtGithub: 1, mergedAt: 1, additions: 1, deletions: 1, changedFiles: 1 },
    issues: { state: 1, createdAtGithub: 1, closedAt: 1, comments: 1 },
    releases: { publishedAtGithub: 1, draft: 1, prerelease: 1 },
    reviews: { pullRequestId: 1, "reviewer.login": 1, state: 1, submittedAt: 1 },
};

async function generateAnalytics(repositoryId) {

    const cacheKey = `analytics:${repositoryId}`;
    const cachedAnalytics = await getCache(cacheKey);

    if (cachedAnalytics) {
        console.log("Analytics cache hit");
        return cachedAnalytics;
    }

    console.log("Analytics cache miss");

    const [commits, contributors, pullRequests, issues, releases, reviews] = await Promise.all([
        commitRepository.findByRepositoryId(repositoryId, PROJECTIONS.commits),
        contributorRepository.findByRepositoryId(repositoryId, PROJECTIONS.contributors),
        pullRequestRepository.findByRepositoryId(repositoryId, PROJECTIONS.pullRequests),
        issueRepository.findByRepositoryId(repositoryId, PROJECTIONS.issues),
        releaseRepository.findByRepositoryId(repositoryId, PROJECTIONS.releases),
        pullRequestReviewRepository.findByRepositoryId(repositoryId, PROJECTIONS.reviews),
    ]);

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
    
    // the analytics stand on their own; an AI outage shouldn't hide them
    let aiExplanation = null;
    let aiError = null;
    try {
        aiExplanation = await generateRepositoryExplanation(aiContext);
    } catch (error) {
        console.error("AI explanation failed:", error.message);
        aiError = "The AI explanation is unavailable right now.";
    }

    const result = {
        ...analytics,
        health,
        bottlenecks,
        aiContext,
        aiExplanation,
        aiError,
    };

    await setCache(cacheKey, result, aiExplanation ? CACHE_SECONDS : CACHE_SECONDS_WITHOUT_AI);

    return result;
}
