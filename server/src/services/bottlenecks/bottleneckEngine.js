import { detectActivityBottlenecks } from "./activityBottlenecks.js";
import { detectCollaborationBottlenecks } from "./collaborationBottlenecks.js";
import { detectIssueBottlenecks } from "./issueBottlenecks.js";
import { detectContributorBottlenecks } from "./contributorBottlenecks.js";
import { detectReleaseBottlenecks } from "./releaseBottlenecks.js";
import { detectReviewBottlenecks } from "./reviewBottlenecks.js";

export { detectRepositoryBottlenecks };

function detectRepositoryBottlenecks(analytics, health) {
    if (!analytics || !health) {
        throw new Error(
            "Analytics and health data are required"
        );
    }

    const bottlenecks = [
        ...detectActivityBottlenecks(
            analytics.activity,
            health.dimensions.activity
        ),

        ...detectCollaborationBottlenecks(
            analytics.collaboration,
            health.dimensions.collaboration
        ),

        ...detectIssueBottlenecks(
            analytics.issues,
            health.dimensions.issues
        ),

        ...detectContributorBottlenecks(
            analytics.contributors,
            health.dimensions.contributors
        ),

        ...detectReleaseBottlenecks(
            analytics.releases,
            health.dimensions.releases
        ),

        ...detectReviewBottlenecks(
            analytics.pullRequestReviews,
            health.dimensions.reviews
        )
    ];

    return {
        total: bottlenecks.length,
        critical: bottlenecks.filter(
            item => item.severity === "critical"
        ).length,
        warning: bottlenecks.filter(
            item => item.severity === "warning"
        ).length,
        bottlenecks
    };
}