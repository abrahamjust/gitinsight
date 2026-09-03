import { getHealthStatus } from "../status.js";
import { scoreHigherIsBetter } from "../scoring/higherIsBetter.js";
import { scoreLowerIsBetter } from "../scoring/lowerIsBetter.js";
import { createMetricResult } from "../utils/metricResult.js";
import { calculateWeightedScore } from "../utils/aggregation.js";
import { releaseThresholds } from "../thresholds.js";

export { calculateReleaseHealth };

const releaseMetricWeights = {
    releasesLast90Days: 0.25,
    medianReleaseIntervalDays: 0.30,
    longestReleaseGapDays: 0.20,
    latestReleaseAgeDays: 0.25,
};


function calculateReleaseHealth(releases) {

    // No release data / repository does not use releases
    if (
        !releases ||
        !releases.totalReleases ||
        releases.totalReleases === 0
    ) {
        return {
            score: null,
            status: "not_applicable",
            metrics: {},
        };
    }


    const metrics = {

        // Higher number of releases = healthier
        releasesLast90Days: createMetricResult(
            releases.releasesLast90Days,
            scoreHigherIsBetter(
                releases.releasesLast90Days,
                releaseThresholds.releasesLast90Days
            )
        ),


        // Shorter interval = healthier
        medianReleaseIntervalDays: createMetricResult(
            releases.medianReleaseIntervalDays,
            scoreLowerIsBetter(
                releases.medianReleaseIntervalDays,
                releaseThresholds.medianReleaseIntervalDays
            )
        ),


        // Smaller gap = healthier
        longestReleaseGapDays: createMetricResult(
            releases.longestReleaseGapDays,
            scoreLowerIsBetter(
                releases.longestReleaseGapDays,
                releaseThresholds.longestReleaseGapDays
            )
        ),


        // More recent release = healthier
        latestReleaseAgeDays: createMetricResult(
            releases.latestReleaseAgeDays,
            scoreLowerIsBetter(
                releases.latestReleaseAgeDays,
                releaseThresholds.latestReleaseAgeDays
            )
        ),
    };


    const score = calculateWeightedScore(
        metrics,
        releaseMetricWeights
    );


    return {
        score,
        status: getHealthStatus(score),
        metrics,
    };
}