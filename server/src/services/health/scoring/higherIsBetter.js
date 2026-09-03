export { scoreHigherIsBetter };

function scoreHigherIsBetter(value,
    {
        critical,
        warning,
        good,
        excellent,
    }
) {
    if (value === null || value === undefined) {
        return null;
    }

    if (value >= excellent) {
        return 100;
    }

    if (value >= good) {
        return Math.round(
            75 +
            ((value - good) / (excellent - good)) * 25
        );
    }

    if (value >= warning) {
        return Math.round(
            50 +
            ((value - warning) / (good - warning)) * 25
        );
    }

    if (value >= critical) {
        return Math.round(
            ((value - critical) / (warning - critical)) * 50
        );
    }

    return 0;
}