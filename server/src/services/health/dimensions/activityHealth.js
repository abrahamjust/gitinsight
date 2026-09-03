import { scoreHigherIsBetter } from "../scoring/higherIsBetter.js";
import { scoreLowerIsBetter } from "../scoring/lowerIsBetter.js";
// import { scoreTargetRange } from "../scoring/targetRange.js";
import { scoreActivityTrend } from "../scoring/trendScore.js";
import { createMetricResult } from "../utils/metricResult.js";
import { getHealthStatus } from "../status.js";
import { calculateWeightedScore } from "../utils/aggregation.js";
import { activityThresholds } from "../thresholds.js";
import { activityMetricWeights } from "../weights.js";

export { calculateActivityHealth };

function calculateActivityHealth(activity) {

    const commitsLast30Days =
        activity.commitsLast30Days ?? null;

    const commitsPerWeek =
        activity.commitsPerWeek ?? null;

    const longestInactivityDays =
        activity.longestInactivityDays ?? null;

    const trendPercent =
        activity.trend?.changePercent ?? null;


    const metrics = {

        commitsLast30Days: createMetricResult(
            commitsLast30Days,
            scoreHigherIsBetter(
                commitsLast30Days,
                activityThresholds.commitsLast30Days
            )
        ),

        commitsPerWeek: createMetricResult(
            commitsPerWeek,
            scoreHigherIsBetter(
                commitsPerWeek,
                activityThresholds.commitsPerWeek
            )
        ),

        longestInactivityDays: createMetricResult(
            longestInactivityDays,
            scoreLowerIsBetter(
                longestInactivityDays,
                activityThresholds.longestInactivityDays
            )
        ),

        trend: createMetricResult(
            trendPercent,
            scoreActivityTrend(trendPercent)
        ),
    };


    const score = calculateWeightedScore(
        metrics,
        activityMetricWeights
    );


    return {
        score,
        status: getHealthStatus(score),
        metrics,
    };
}

