import { calculateCollaborationHealth } from "./dimensions/collaborationHealth.js";

const collaboration = {
    totalPRs: 48,
    openPRs: 12,
    closedPRs: 36,
    mergedPRs: 8,

    mergeRate: 22.22,

    averageTimeToMerge: 1193.72,
    medianTimeToMerge: 119.53,

    averagePRSize: 57.9,
    medianPRSize: 3,

    averageChangedFiles: 2.6,
    medianChangedFiles: 1,

    prsLast7Days: 0,
    prsLast30Days: 0,
    prsPrevious30Days: 0,

    activityTrend: {
        changePercent: 0,
        direction: "stable",
    },
};

const result = calculateCollaborationHealth(collaboration);

console.dir(result, { depth: null });