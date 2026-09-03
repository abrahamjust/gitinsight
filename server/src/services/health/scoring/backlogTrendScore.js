export function scoreBacklogTrend(value) {
    if (value === null || value === undefined) {
        return null;
    }

    if (value <= -20) return 100;
    if (value <= -5) return 90;
    if (value <= 5) return 75;
    if (value <= 15) return 50;
    if (value <= 30) return 25;

    return 0;
}