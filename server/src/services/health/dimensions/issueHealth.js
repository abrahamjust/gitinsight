import { scoreHigherIsBetter } from "../scoring/higherIsBetter.js";
import { scoreLowerIsBetter } from "../scoring/lowerIsBetter.js";
import { createMetricResult } from "../utils/metricResult.js";
import { getHealthStatus } from "../status.js";
import { calculateWeightedScore } from "../utils/aggregation.js";
import { issueThresholds } from "../thresholds.js";
import { scoreBacklogTrend } from "../scoring/backlogTrendScore.js";

const issueMetricWeights = {
    closureRate: 0.30,
    medianResolutionTimeHours: 0.35,
    averageComments: 0.20,
    backlogTrend: 0.15,
};


export function calculateIssueHealth(issues) {

    // No issues means issue health is not applicable.
    if (!issues.totalIssues) {
        return {
            score: null,
            status: "not_applicable",
            metrics: {},
        };
    }


    const closureRate =
        issues.closureRate ?? null;

    const medianResolutionTimeHours =
        issues.medianResolutionTimeHours ?? null;

    const averageComments =
        issues.averageComments ?? null;

    const backlogTrendPercent =
        issues.backlogTrend?.changePercent ?? null;

    const metrics = {

        closureRate: createMetricResult(
            closureRate,
            scoreHigherIsBetter(
                closureRate,
                issueThresholds.closureRate
            )
        ),

        medianResolutionTimeHours: createMetricResult(
            medianResolutionTimeHours,
            scoreLowerIsBetter(
                medianResolutionTimeHours,
                issueThresholds.medianResolutionTimeHours
            )
        ),

        averageComments: createMetricResult(
            averageComments,
            scoreHigherIsBetter(
                averageComments,
                issueThresholds.averageComments
            )
        ),

        backlogTrend: createMetricResult(
            backlogTrendPercent,
            scoreBacklogTrend(backlogTrendPercent)
        ),
    };


    const score = calculateWeightedScore(
        metrics,
        issueMetricWeights
    );


    return {
        score,
        status: getHealthStatus(score),
        metrics,
    };
}