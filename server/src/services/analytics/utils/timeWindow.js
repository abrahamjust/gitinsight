export {
    getTimeWindow,
    getPreviousTimeWindow,
};

function getTimeWindow (days, now = new Date()) {
    const end = new Date(now);
    const start = new Date(now);

    start.setDate(start.getDate() - days);

    return {
        start,
        end,
    };
}

function getPreviousTimeWindow (days, now = new Date()) {
    const current = getTimeWindow(days, now);

    const end = new Date(current.start);
    const start = new Date(end);

    start.setDate(start.getDate() - days);

    return {
        start,
        end,
    };
}