export { scoreLowerIsBetter };

function scoreLowerIsBetter(value,
    {
        excellent,
        good,
        warning,
        critical,
    }
) {
    if (value === null || value === undefined) {
        return null;
    }

    if (value <= excellent) {
        return 100;
    }

    if (value <= good) {
        return Math.round(
            75 +
            ((good - value) / (good - excellent)) * 25
        );
    }

    if (value <= warning) {
        return Math.round(
            50 +
            ((warning - value) / (warning - good)) * 25
        );
    }

    if (value <= critical) {
        return Math.round(
            ((critical - value) / (critical - warning)) * 50
        );
    }

    return 0;
}