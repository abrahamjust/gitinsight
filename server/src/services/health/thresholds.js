export const activityThresholds = {
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