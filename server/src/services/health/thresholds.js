export { activityThresholds, collaborationThresholds };

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