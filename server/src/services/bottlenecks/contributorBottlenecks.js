export { detectContributorBottlenecks };

function detectContributorBottlenecks(
    contributors,
    health
) {
    const bottlenecks = [];

    if (!contributors || !health) {
        return bottlenecks;
    }

    const metrics = health.metrics;

    if (
        metrics.busFactor?.status === "critical" ||
        metrics.busFactor?.status === "warning"
    ) {
        bottlenecks.push({
            type: "low_bus_factor",
            category: "contributors",
            severity:
                metrics.busFactor.status === "critical"
                    ? "critical"
                    : "warning",
            title: "Low contributor bus factor",
            description:
                "A small number of contributors account for most repository contributions.",
            evidence: {
                busFactor: contributors.estimatedBusFactor,
                totalContributors: contributors.totalContributors
            }
        });
    }

    if (
        metrics.topContributorShare?.status === "critical" ||
        metrics.topContributorShare?.status === "warning"
    ) {
        bottlenecks.push({
            type: "top_contributor_dependency",
            category: "contributors",
            severity:
                metrics.topContributorShare.status === "critical"
                    ? "critical"
                    : "warning",
            title: "High dependency on a single contributor",
            description:
                "A large proportion of contributions come from one contributor.",
            evidence: {
                topContributorShare:
                    contributors.topContributorShare,
                topContributor:
                    contributors.topContributor
            }
        });
    }

    if (
        metrics.topThreeContributorShare?.status === "critical"
    ) {
        bottlenecks.push({
            type: "contributor_concentration",
            category: "contributors",
            severity: "critical",
            title: "Contribution is highly concentrated",
            description:
                "Most repository contributions are concentrated among the top three contributors.",
            evidence: {
                topThreeContributorShare:
                    contributors.topThreeContributorShare,
                concentrationHHI:
                    contributors.concentrationHHI
            }
        });
    }

    return bottlenecks;
}