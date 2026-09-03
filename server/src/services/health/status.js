export { getHealthStatus };

function getHealthStatus(score) {
    if (score === null || score === undefined) {
        return "not_applicable";
    } else if (score >= 90) {
        return "excellent";
    } else if (score >= 75) {
        return "good";
    } else if (score >= 50) {
        return "warning";
    } else {
        return "critical";
    }
}