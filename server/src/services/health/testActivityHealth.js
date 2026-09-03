import { calculateActivityHealth } from "./dimensions/activityHealth.js";

const activity = {
    totalCommits: 120,
    commitsLast7Days: 4,
    commitsLast30Days: 18,
    commitsPrevious30Days: 12,
    commitsPerWeek: 4.5,
    totalContributors: 12,
    activeContributors: 5,
    longestInactivityDays: 8,

    trend: {
        changePercent: 50,
        direction: "increasing",
    },
};

const result = calculateActivityHealth(activity);

console.dir(result, { depth: null });