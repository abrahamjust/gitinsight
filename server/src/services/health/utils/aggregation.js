export { calculateWeightedScore };

function calculateWeightedScore(metrics, weights) {

    let weightedTotal = 0;
    let applicableWeight = 0;

    for (const [metricName, metric] of Object.entries(metrics)) {

        if (metric.score === null) {
            continue;
        }

        const weight = weights[metricName];

        if (!weight) {
            continue;
        }

        weightedTotal += metric.score * weight;
        applicableWeight += weight;
    }

    if (applicableWeight === 0) {
        return null;
    }

    return Math.round(weightedTotal / applicableWeight);
}