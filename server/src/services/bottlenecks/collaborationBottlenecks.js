export { detectCollaborationBottlenecks };

function detectCollaborationBottlenecks(collaboration, health) {
    const bottlenecks = [];

    if (!collaboration || !health) {
        return bottlenecks;
    }

    const metrics = health.metrics;

    if (
        metrics.mergeRate?.status === "critical"
    ) {
        bottlenecks.push({
            type: "low_pr_merge_rate",
            category: "collaboration",
            severity: "critical",
            title: "Low pull request merge rate",
            description:
                "A relatively small proportion of pull requests are being merged.",
            evidence: {
                mergeRate: collaboration.mergeRate,
                totalPRs: collaboration.totalPRs,
                mergedPRs: collaboration.mergedPRs
            }
        });
    }

    if (
        metrics.medianTimeToMergeHours?.status === "warning" ||
        metrics.medianTimeToMergeHours?.status === "critical"
    ) {
        bottlenecks.push({
            type: "slow_pr_merging",
            category: "collaboration",
            severity:
                metrics.medianTimeToMergeHours.status === "critical"
                    ? "critical"
                    : "warning",
            title: "Pull requests take a long time to merge",
            description:
                "The median time required to merge a pull request is relatively high.",
            evidence: {
                medianTimeToMergeHours:
                    collaboration.medianTimeToMerge
            }
        });
    }

    return bottlenecks;
}