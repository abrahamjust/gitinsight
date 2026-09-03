export { activityThresholds, collaborationThresholds, issueThresholds, contributorThresholds, releaseThresholds, reviewThresholds };

const activityThresholds = {
    commitsLast30Days: {
        critical: 0,
        warning: 5,
        good: 15,
        excellent: 30,
    },

    commitsPerWeek: {
        critical: 0,
        warning: 1,
        good: 5,
        excellent: 10,
    },

    longestInactivityDays: {
        excellent: 3,
        good: 7,
        warning: 21,
        critical: 60,
    },

    activityTrendPercent: {
        minimum: -50,
        targetMin: -10,
        targetMax: 25,
        maximum: 100,
    },
};

const collaborationThresholds = {
    mergeRate: {
        critical: 10,
        warning: 30,
        good: 60,
        excellent: 80,
    },

    medianTimeToMergeHours: {
        excellent: 24,
        good: 72,
        warning: 168,
        critical: 336,
    },

    medianPRSize: {
        excellent: 10,
        good: 50,
        warning: 150,
        critical: 500,
    },
};

const issueThresholds = {
    closureRate: {
        critical: 20,
        warning: 40,
        good: 70,
        excellent: 90,
    },

    medianResolutionTimeHours: {
        excellent: 24,
        good: 72,
        warning: 168,
        critical: 336,
    },

    averageComments: {
        critical: 0,
        warning: 1,
        good: 3,
        excellent: 5,
    },
};

const contributorThresholds = {
    busFactor: {
        critical: 1,
        warning: 2,
        good: 4,
        excellent: 8,
    },

    topContributorShare: {
        critical: 70,
        warning: 50,
        good: 30,
        excellent: 15,
    },

    topThreeContributorShare: {
        critical: 95,
        warning: 85,
        good: 70,
        excellent: 50,
    },

    concentrationHHI: {
        excellent: 0.10,
        good: 0.20,
        warning: 0.35,
        critical: 0.50,
    },
};

const releaseThresholds = {

    // More recent releases = healthier
    releasesLast90Days: {
        critical: 0,
        warning: 1,
        good: 3,
        excellent: 6,
    },

    // Shorter release interval = healthier
    medianReleaseIntervalDays: {
        excellent: 14,
        good: 30,
        warning: 90,
        critical: 180,
    },

    // Smaller longest gap = healthier
    longestReleaseGapDays: {
        excellent: 60,
        good: 120,
        warning: 240,
        critical: 365,
    },

    // More recent latest release = healthier
    latestReleaseAgeDays: {
        excellent: 30,
        good: 90,
        warning: 180,
        critical: 365,
    },
};


const reviewThresholds = {

    // Percentage of PRs receiving at least one review
    reviewCoverage: {
        critical: 20,
        warning: 40,
        good: 70,
        excellent: 90,
    },

    // Hours until the first review
    medianTimeToFirstReviewHours: {
        excellent: 24,
        good: 72,
        warning: 168,
        critical: 336,
    },

    // Lower concentration = healthier
    reviewerConcentration: {
        excellent: 0.20,
        good: 0.35,
        warning: 0.50,
        critical: 0.70,
    },

    // Number of unique reviewers
    uniqueReviewers: {
        critical: 1,
        warning: 2,
        good: 5,
        excellent: 10,
    },
};