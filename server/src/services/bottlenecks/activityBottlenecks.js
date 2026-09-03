export { detectActivityBottlenecks };

function detectActivityBottlenecks(activity, health) {
    const bottlenecks = [];

    if (!activity || !health) {
        return bottlenecks;
    }

    const metrics = health.metrics;

    if (
        metrics.commitsLast30Days?.status === "critical" &&
        activity.commitsLast30Days === 0
    ) {
        bottlenecks.push({
            type: "repository_inactivity",
            category: "activity",
            severity: "critical",
            title: "Repository is inactive",
            description:
                "No commits have been made to the repository in the last 30 days.",
            evidence: {
                commitsLast30Days: activity.commitsLast30Days,
                commitsPerWeek: activity.commitsPerWeek
            }
        });
    }

    if (
        activity.longestInactivityDays !== null &&
        activity.longestInactivityDays >= 90
    ) {
        bottlenecks.push({
            type: "prolonged_inactivity",
            category: "activity",
            severity: "critical",
            title: "Prolonged development inactivity",
            description:
                "The repository has experienced an extended period without commits.",
            evidence: {
                longestInactivityDays:
                    activity.longestInactivityDays
            }
        });
    }

    if (
        activity.trend?.direction === "declining"
    ) {
        bottlenecks.push({
            type: "declining_activity",
            category: "activity",
            severity: "warning",
            title: "Development activity is declining",
            description:
                "Recent commit activity is trending downward.",
            evidence: {
                changePercent: activity.trend.changePercent
            }
        });
    }

    return bottlenecks;
}