import {
    getTimeWindow,
    getPreviousTimeWindow,
} from "../utils/timeWindow.js";

export { calculateCollaboration }

function calculateCollaboration (pullRequests, now = new Date()) {

    const totalPRs = pullRequests.length;

    const openPRs = pullRequests.filter(
        pr => pr.state === "open"
    ).length;

    const closedPRs = pullRequests.filter(
        pr => pr.state === "closed"
    ).length;

    const mergedPRs = pullRequests.filter(
        pr => pr.mergedAt !== null
    ).length;

    const mergeRate = closedPRs > 0 ? (mergedPRs / closedPRs) * 100 : 0;

    const mergeTimes = pullRequests.filter(
        pr => pr.createdAtGithub && pr.mergedAt
    ).map(
        pr => {
            const created = new Date(pr.createdAtGithub);
            const merged = new Date(pr.mergedAt);
            return (
                merged - created
            ) / (1000 * 60 * 60);
        }
    );

    const averageTimeToMerge = calculateAverage(mergeTimes);
    const medianTimeToMerge = calculateMedian(mergeTimes);

    const prSizes = pullRequests.map(
        pr => (pr.additions || 0) + (pr.deletions || 0)
    );

    const averagePRSize = calculateAverage(prSizes);
    const medianPRSize = calculateMedian(prSizes);

    const changedFiles = pullRequests.map(
        pr => pr.changedFiles || 0
    );

    const averageChangedFiles = calculateAverage(changedFiles);
    const medianChangedFiles = calculateMedian(changedFiles);

    const current7d = getTimeWindow(7, now);
    const current30d = getTimeWindow(30, now);
    const previous30d = getPreviousTimeWindow(30, now);

    const prsLast7Days = pullRequests.filter(pr =>
        isWithinWindow(pr.createdAtGithub, current7d)
    ).length;

    const prsLast30Days = pullRequests.filter(pr =>
        isWithinWindow(pr.createdAtGithub, current30d)
    ).length;

    const prsPrevious30Days = pullRequests.filter(pr =>
        isWithinWindow(pr.createdAtGithub, previous30d)
    ).length;

    const prsPerWeek = prsLast30Days / 4.2857;

    const activityTrend = calculateTrend(
        prsLast30Days,
        prsPrevious30Days
    );

    return {
        totalPRs,
        openPRs,
        closedPRs,
        mergedPRs,
        mergeRate: Number(mergeRate.toFixed(2)),
        averageTimeToMerge: Number(averageTimeToMerge.toFixed(2)),
        medianTimeToMerge: Number(medianTimeToMerge.toFixed(2)),
        averagePRSize: Number(averagePRSize.toFixed(2)),
        medianPRSize: Number(medianPRSize.toFixed(2)),
        averageChangedFiles: Number(averageChangedFiles.toFixed(2)),
        medianChangedFiles: Number(medianChangedFiles.toFixed(2)),
        prsLast7Days,
        prsLast30Days,
        prsPrevious30Days,
        prsPerWeek: Number(
            prsPerWeek.toFixed(2)
        ),
        activityTrend,
    };
}

function calculateAverage (values) {
    if (values.length === 0) {
        return 0;
    }
    const sum = values.reduce(
        (total, value) => total + value, 0
    );
    return sum / values.length;
}

function calculateMedian (values) {
    if (values.length === 0) {
        return 0;
    }

    const sorted = [...values].sort(
        (a, b) => a - b
    );

    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (
            (sorted[middle - 1] + sorted[middle]) / 2
        );
    }

    return sorted[middle];
}

function isWithinWindow (date, window) {
    if (!date) {
        return false;
    }

    const timestamp = new Date(date);

    return (
        timestamp >= window.start && timestamp < window.end
    );
}

function calculateTrend(current, previous) {
    if (previous === 0) {
        if (current === 0) {
            return {
                changePercent: 0,
                direction: "stable",
            };
        }

        return {
            changePercent: null,
            direction: "started",
        };
    }

    const changePercent =
        ((current - previous) / previous) * 100;

    let direction = "stable";

    if (changePercent > 0) {
        direction = "up";
    } else if (changePercent < 0) {
        direction = "down";
    }

    return {
        changePercent: Number(
            changePercent.toFixed(2)
        ),
        direction,
    };
}