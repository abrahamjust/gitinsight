export { scoreActivityTrend };

function scoreActivityTrend(value) {
    if (value === null || value === undefined) {
        return null;
    }

    if (value <= -50) {
        return 0;
    }

    if (value < -10) {
        return Math.round(
            ((value + 50) / 40) * 50
        );
    }

    if (value < 0) {
        return Math.round(
            50 + ((value + 10) / 10) * 25
        );
    }

    if (value < 25) {
        return Math.round(
            75 + (value / 25) * 25
        );
    }

    return 100;
}