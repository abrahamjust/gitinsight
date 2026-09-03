import { getHealthStatus } from "../status.js";
import { scoreHigherIsBetter } from "../scoring/higherIsBetter.js";
import { scoreLowerIsBetter } from "../scoring/lowerIsBetter.js";
import { createMetricResult } from "../utils/metricResult.js";
import { calculateWeightedScore } from "../utils/aggregation.js";
import { contributorThresholds } from "../thresholds.js";

export { calculateContributorHealth };

const contributorMetricWeights = {
    busFactor: 0.40,
    topContributorShare: 0.25,
    topThreeContributorShare: 0.15,
    concentrationHHI: 0.20,
};


function calculateContributorHealth(contributors) {

    // No contributor data
    if (
        !contributors ||
        !contributors.totalContributors ||
        contributors.totalContributors === 0
    ) {
        return {
            score: null,
            status: "not_applicable",
            metrics: {},
        };
    }


    const metrics = {

        // Higher bus factor = healthier
        busFactor: createMetricResult(
            contributors.estimatedBusFactor,
            scoreHigherIsBetter(
                contributors.estimatedBusFactor,
                contributorThresholds.busFactor
            )
        ),


        // Lower top contributor share = healthier
        topContributorShare: createMetricResult(
            contributors.topContributorShare,
            scoreLowerIsBetter(
                contributors.topContributorShare,
                contributorThresholds.topContributorShare
            )
        ),


        // Lower top-three concentration = healthier
        topThreeContributorShare: createMetricResult(
            contributors.topThreeContributorShare,
            scoreLowerIsBetter(
                contributors.topThreeContributorShare,
                contributorThresholds.topThreeContributorShare
            )
        ),


        // Lower HHI = healthier
        concentrationHHI: createMetricResult(
            contributors.concentrationHHI,
            scoreLowerIsBetter(
                contributors.concentrationHHI,
                contributorThresholds.concentrationHHI
            )
        ),
    };


    const score = calculateWeightedScore(
        metrics,
        contributorMetricWeights
    );


    return {
        score,
        status: getHealthStatus(score),
        metrics,
    };
}