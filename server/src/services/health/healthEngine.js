import { calculateActivityHealth } from "./dimensions/activityHealth.js";
import { calculateCollaborationHealth } from "./dimensions/collaborationHealth.js";
import { calculateIssueHealth } from "./dimensions/issueHealth.js";
import { calculateContributorHealth } from "./dimensions/contributorHealth.js";
import { calculateReleaseHealth } from "./dimensions/releaseHealth.js";
import { calculateReviewHealth } from "./dimensions/reviewHealth.js";

import { calculateOverallHealth } from "./overallHealth.js";


export function calculateRepositoryHealth(analytics) {

    if (!analytics) {
        throw new Error("Analytics data is required");
    }


    const dimensions = {

        activity: calculateActivityHealth(
            analytics.activity
        ),

        collaboration: calculateCollaborationHealth(
            analytics.collaboration
        ),

        issues: calculateIssueHealth(
            analytics.issues
        ),

        contributors: calculateContributorHealth(
            analytics.contributors
        ),

        releases: calculateReleaseHealth(
            analytics.releases
        ),

        reviews: calculateReviewHealth(
            analytics.pullRequestReviews
        ),
    };


    return calculateOverallHealth(dimensions);
}