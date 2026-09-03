export { detectIssueBottlenecks };

function detectIssueBottlenecks(issues, health) {
    const bottlenecks = [];

    if (!issues || !health) {
        return bottlenecks;
    }

    const metrics = health.metrics;

    if (
        metrics.closureRate?.status === "critical" ||
        metrics.closureRate?.status === "warning"
    ) {
        bottlenecks.push({
            type: "low_issue_closure_rate",
            category: "issues",
            severity:
                metrics.closureRate.status === "critical"
                    ? "critical"
                    : "warning",
            title: "Issues are being closed slowly",
            description:
                "A relatively low proportion of repository issues have been closed.",
            evidence: {
                closureRate: issues.closureRate,
                openIssues: issues.openIssues,
                closedIssues: issues.closedIssues
            }
        });
    }

    if (
        metrics.medianResolutionTimeHours?.status === "critical"
    ) {
        bottlenecks.push({
            type: "slow_issue_resolution",
            category: "issues",
            severity: "critical",
            title: "Issues take a long time to resolve",
            description:
                "The median issue resolution time is unusually high.",
            evidence: {
                medianResolutionTimeHours:
                    issues.medianResolutionTimeHours
            }
        });
    }

    return bottlenecks;
}