import { getHealthStatus } from "./status.js";
import { calculateWeightedScore } from "./utils/aggregation.js";

const dimensionWeights = {
    activity: 0.20,
    collaboration: 0.20,
    issues: 0.15,
    contributors: 0.15,
    releases: 0.10,
    reviews: 0.20,
};


function calculateOverallScore(dimensions) {

    const scoreMetrics = {};

    for (const [dimensionName, dimension] of Object.entries(dimensions)) {

        if (
            !dimension ||
            dimension.score === null ||
            dimension.score === undefined
        ) {
            continue;
        }

        scoreMetrics[dimensionName] = {
            score: dimension.score,
        };
    }

    return calculateWeightedScore(
        scoreMetrics,
        dimensionWeights
    );
}


function calculateConfidence(dimensions) {

    const applicableDimensions = Object.values(dimensions)
        .filter(
            dimension =>
                dimension &&
                dimension.score !== null &&
                dimension.score !== undefined
        );

    if (applicableDimensions.length === 0) {
        return "none";
    }

    if (applicableDimensions.length >= 5) {
        return "high";
    }

    if (applicableDimensions.length >= 3) {
        return "medium";
    }

    return "low";
}


export function calculateOverallHealth(dimensions) {

    const score = calculateOverallScore(dimensions);

    return {
        score,
        status: getHealthStatus(score),
        confidence: calculateConfidence(dimensions),
        dimensions,
        calculatedAt: new Date(),
    };
}