import { calculateReleaseHealth } from "./dimensions/releaseHealth.js";


const releases = {
    totalReleases: 0,
    publishedReleases: 0,
    draftReleases: [],
    prereleases: [],
    releasesLast30Days: 0,
    releasesLast90Days: 0,
    averageReleaseIntervalDays: 0,
    medianReleaseIntervalDays: 0,
    longestReleaseGapDays: 0,
    latestReleaseAgeDays: null,
};


console.dir(
    calculateReleaseHealth(releases),
    { depth: null }
);