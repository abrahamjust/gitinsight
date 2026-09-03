import { getHealthStatus } from "../status.js";
export { createMetricResult };

function createMetricResult(value, score) {
    return {
        value,
        score,
        status: getHealthStatus(score),
    };
}