export { buildAIContext };

function buildAIContext(analytics, health, bottlenecks) {
    if (!analytics || !health || !bottlenecks) {
        throw new Error(
            "Analytics, health, and bottleneck data are required"
        );
    }

    return {
        repositoryHealth: {
            score: health.score,
            status: health.status,
            confidence: health.confidence,
        },

        dimensions: Object.fromEntries(
            Object.entries(health.dimensions).map(
                ([name, dimension]) => [
                    name,
                    {
                        score: dimension.score,
                        status: dimension.status,
                        metrics: dimension.metrics,
                    },
                ]
            )
        ),

        bottlenecks: {
            total: bottlenecks.total,
            critical: bottlenecks.critical,
            warning: bottlenecks.warning,

            criticalItems: bottlenecks.bottlenecks.filter(
                item => item.severity === "critical"
            ),

            warningItems: bottlenecks.bottlenecks.filter(
                item => item.severity === "warning"
            ),
        },

        analytics: {
            activity: analytics.activity,
            collaboration: analytics.collaboration,
            issues: analytics.issues,
            contributors: analytics.contributors,
            releases: analytics.releases,
            pullRequestReviews: analytics.pullRequestReviews,
        },
    };
}