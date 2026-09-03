export { detectReviewBottlenecks };

function detectReviewBottlenecks(reviews, health) {
    const bottlenecks = [];

    if (!reviews || !health) {
        return bottlenecks;
    }

    const metrics = health.metrics;

    if (
        metrics.reviewCoverage?.status === "critical" ||
        metrics.reviewCoverage?.status === "warning"
    ) {
        bottlenecks.push({
            type: "low_review_coverage",
            category: "reviews",
            severity:
                metrics.reviewCoverage.status === "critical"
                    ? "critical"
                    : "warning",
            title: "Low pull request review coverage",
            description:
                "A significant proportion of pull requests are merged or processed without recorded reviews.",
            evidence: {
                reviewCoverage: reviews.reviewCoverage,
                reviewedPRs: reviews.reviewedPRs,
                prsWithoutReview: reviews.prsWithoutReview
            }
        });
    }

    if (
        metrics.medianTimeToFirstReviewHours?.status === "critical"
    ) {
        bottlenecks.push({
            type: "slow_first_review",
            category: "reviews",
            severity: "critical",
            title: "Pull requests wait too long for review",
            description:
                "The median time before a pull request receives its first review is unusually high.",
            evidence: {
                medianTimeToFirstReviewHours:
                    reviews.medianTimeToFirstReviewHours
            }
        });
    }

    if (
        metrics.reviewerConcentration?.status === "warning" ||
        metrics.reviewerConcentration?.status === "critical"
    ) {
        bottlenecks.push({
            type: "reviewer_concentration",
            category: "reviews",
            severity:
                metrics.reviewerConcentration.status === "critical"
                    ? "critical"
                    : "warning",
            title: "Code review responsibility is concentrated",
            description:
                "A small number of reviewers perform a large proportion of reviews.",
            evidence: {
                reviewerConcentration:
                    reviews.reviewerConcentration,
                topReviewer:
                    reviews.topReviewer
            }
        });
    }

    return bottlenecks;
}