export { dimensionWeights, activityMetricWeights, collaborationMetricWeights, issueMetricWeights, contributorMetricWeights, releaseMetricWeights, reviewMetricWeights };

const dimensionWeights = {
    activity: 0.20,
    collaboration: 0.20,
    issues: 0.15,
    contributors: 0.15,
    releases: 0.10,
    reviews: 0.20,
};

const activityMetricWeights = {
    commitsLast30Days: 0.30,
    commitsPerWeek: 0.25,
    longestInactivityDays: 0.30,
    trend: 0.15,
};

const collaborationMetricWeights = {
    mergeRate: 0.25,
    medianTimeToMergeHours: 0.30,
    medianPRSize: 0.20,
};

const issueMetricWeights = {
    closureRate: 0.30,
    medianResolutionTimeHours: 0.35,
    averageComments: 0.20,
    backlogTrend: 0.15,
};

const contributorMetricWeights = {
    busFactor: 0.40,
    topContributorShare: 0.25,
    topThreeContributorShare: 0.15,
    concentrationHHI: 0.20,
};

const releaseMetricWeights = {
    releasesLast90Days: 0.25,
    medianReleaseIntervalDays: 0.30,
    longestReleaseGapDays: 0.20,
    latestReleaseAgeDays: 0.25,
};

const reviewMetricWeights = {
    reviewCoverage: 0.35,
    medianTimeToFirstReviewHours: 0.30,
    reviewerConcentration: 0.20,
    uniqueReviewers: 0.15,
};