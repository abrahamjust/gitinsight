import { calculateIssueHealth } from "./dimensions/issueHealth.js";

const issues = {
    totalIssues: 15,
    openIssues: 8,
    closedIssues: 7,

    closureRate: 46.67,

    averageResolutionTimeHours: 2370.95,
    medianResolutionTimeHours: 36.44,

    issuesCreatedLast7Days: 0,
    issuesCreatedLast30Days: 0,
    issuesCreatedPrevious30Days: 0,
    issuesClosedLast30Days: 0,

    averageComments: 1.47,

    backlogTrend: {
        changePercent: 0,
        direction: "stable",
    },
};

const result = calculateIssueHealth(issues);

console.dir(result, { depth: null });