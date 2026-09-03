export { scoreTargetRange };

function scoreTargetRange(value,
    {
        minimum,
        targetMin,
        targetMax,
        maximum,
    }
) {
    if (value === null || value === undefined) {
        return null;
    }

    if (value >= targetMin && value <= targetMax) {
        return 100;
    }

    if (value < minimum || value > maximum) {
        return 0;
    }

    if (value < targetMin) {
        return Math.round(
            ((value - minimum) /
                (targetMin - minimum)) *
                100
        );
    }

    return Math.round(
        ((maximum - value) /
            (maximum - targetMax)) *
            100
    );
}