import { calculateOverallHealth } from "./overallHealth.js";


const dimensions = {

    activity: {
        score: 79,
        status: "good",
        metrics: {
            commitsLast30Days: {
                value: 18,
                score: 80,
                status: "good",
            },
            commitsPerWeek: {
                value: 4.5,
                score: 72,
                status: "warning",
            },
            longestInactivityDays: {
                value: 8,
                score: 73,
                status: "warning",
            },
            trend: {
                value: 50,
                score: 100,
                status: "excellent",
            },
        },
    },


    collaboration: {
        score: 62,
        status: "warning",
        metrics: {
            mergeRate: {
                value: 22.22,
                score: 31,
                status: "critical",
            },
            medianTimeToMergeHours: {
                value: 119.53,
                score: 63,
                status: "warning",
            },
            medianPRSize: {
                value: 3,
                score: 100,
                status: "excellent",
            },
        },
    },


    issues: {
        score: 72,
        status: "warning",
        metrics: {
            closureRate: {
                value: 46.67,
                score: 56,
                status: "warning",
            },
            medianResolutionTimeHours: {
                value: 36.44,
                score: 94,
                status: "excellent",
            },
            averageComments: {
                value: 1.47,
                score: 56,
                status: "warning",
            },
            backlogTrend: {
                value: 0,
                score: 75,
                status: "good",
            },
        },
    },


    contributors: {
        score: 48,
        status: "critical",
        metrics: {
            busFactor: {
                value: 2,
                score: 50,
                status: "warning",
            },
            topContributorShare: {
                value: 49.44,
                score: 51,
                status: "warning",
            },
            topThreeContributorShare: {
                value: 88.76,
                score: 31,
                status: "critical",
            },
            concentrationHHI: {
                value: 0.346,
                score: 51,
                status: "warning",
            },
        },
    },


    releases: {
        score: null,
        status: "not_applicable",
        metrics: {},
    },


    reviews: {
        score: 65,
        status: "warning",
        metrics: {
            reviewCoverage: {
                value: 33.33,
                score: 33,
                status: "critical",
            },
            medianTimeToFirstReviewHours: {
                value: 42.25,
                score: 90,
                status: "excellent",
            },
            reviewerConcentration: {
                value: 0.46,
                score: 57,
                status: "warning",
            },
            uniqueReviewers: {
                value: 17,
                score: 100,
                status: "excellent",
            },
        },
    },
};


console.dir(
    calculateOverallHealth(dimensions),
    { depth: null }
);