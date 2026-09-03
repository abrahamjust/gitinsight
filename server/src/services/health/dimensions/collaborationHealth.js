import { scoreHigherIsBetter } from "../scoring/higherIsBetter.js";
import { scoreLowerIsBetter } from "../scoring/lowerIsBetter.js";
import { createMetricResult } from "../utils/metricResult.js";
import { getHealthStatus } from "../status.js";
import { calculateWeightedScore } from "../utils/aggregation.js";
import { collaborationThresholds } from "../thresholds.js";

export { calculateCollaborationHealth };

const collaborationMetricWeights = {
    mergeRate: 0.25,
    medianTimeToMergeHours: 0.30,
    medianPRSize: 0.20,
};


function calculateCollaborationHealth(collaboration) {

    if (!collaboration.totalPRs) {
        return {
            score: null,
            status: "not_applicable",
            metrics: {},
        };
    }

    const mergeRate =
        collaboration.mergeRate ?? null;

    const medianTimeToMergeHours =
        collaboration.medianTimeToMerge ?? null;

    const medianPRSize =
        collaboration.medianPRSize ?? null;

    const prsLast30Days =
        collaboration.prsLast30Days ?? null;


    const metrics = {

        mergeRate: createMetricResult(
            mergeRate,
            scoreHigherIsBetter(
                mergeRate,
                collaborationThresholds.mergeRate
            )
        ),

        medianTimeToMergeHours: createMetricResult(
            medianTimeToMergeHours,
            scoreLowerIsBetter(
                medianTimeToMergeHours,
                collaborationThresholds.medianTimeToMergeHours
            )
        ),

        medianPRSize: createMetricResult(
            medianPRSize,
            scoreLowerIsBetter(
                medianPRSize,
                collaborationThresholds.medianPRSize
            )
        ),
    };


    const score = calculateWeightedScore(
        metrics,
        collaborationMetricWeights
    );


    return {
        score,
        status: getHealthStatus(score),
        metrics,
    };
}