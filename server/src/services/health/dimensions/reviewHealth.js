import { getHealthStatus } from "../status.js";
import { scoreHigherIsBetter } from "../scoring/higherIsBetter.js";
import { scoreLowerIsBetter } from "../scoring/lowerIsBetter.js";
import { createMetricResult } from "../utils/metricResult.js";
import { calculateWeightedScore } from "../utils/aggregation.js";
import { reviewThresholds } from "../thresholds.js";
import { reviewMetricWeights } from "../weights.js";

export { calculateReviewHealth };

function calculateReviewHealth(reviews) {

    // No review data
    if (
        !reviews ||
        !reviews.totalReviews ||
        reviews.totalReviews === 0
    ) {
        return {
            score: null,
            status: "not_applicable",
            metrics: {},
        };
    }


    const metrics = {

        // Higher coverage = healthier
        reviewCoverage: createMetricResult(
            reviews.reviewCoverage,
            scoreHigherIsBetter(
                reviews.reviewCoverage,
                reviewThresholds.reviewCoverage
            )
        ),


        // Faster first review = healthier
        medianTimeToFirstReviewHours: createMetricResult(
            reviews.medianTimeToFirstReviewHours,
            scoreLowerIsBetter(
                reviews.medianTimeToFirstReviewHours,
                reviewThresholds.medianTimeToFirstReviewHours
            )
        ),


        // Lower reviewer concentration = healthier
        reviewerConcentration: createMetricResult(
            reviews.reviewerConcentration,
            scoreLowerIsBetter(
                reviews.reviewerConcentration,
                reviewThresholds.reviewerConcentration
            )
        ),


        // More unique reviewers = healthier
        uniqueReviewers: createMetricResult(
            reviews.uniqueReviewers,
            scoreHigherIsBetter(
                reviews.uniqueReviewers,
                reviewThresholds.uniqueReviewers
            )
        ),
    };


    const score = calculateWeightedScore(
        metrics,
        reviewMetricWeights
    );


    return {
        score,
        status: getHealthStatus(score),
        metrics,
    };
}