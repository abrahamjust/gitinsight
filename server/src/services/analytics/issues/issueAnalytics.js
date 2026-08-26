import {
    getTimeWindow,
    getPreviousTimeWindow,
} from "../utils/timeWindow.js";

export {
    calculateIssues
};

function calculateIssues(issues, now = new Date()) {

    const totalIssues = issues.length;

    const openIssues = issues.filter(
        issue => issue.state === "open"
    ).length;

    const closedIssues = issues.filter(
        issue => issue.state === "closed"
    ).length;

    const closureRate = totalIssues > 0
        ? (closedIssues / totalIssues) * 100
        : 0;

    const resolutionTimes = issues
        .filter(
            issue =>
                issue.createdAtGithub &&
                issue.closedAt
        )
        .map(issue => {

            const created =
                new Date(issue.createdAtGithub);

            const closed =
                new Date(issue.closedAt);

            return (
                closed - created
            ) / (1000 * 60 * 60);
        });

    const averageResolutionTime =
        calculateAverage(resolutionTimes);

    const medianResolutionTime =
        calculateMedian(resolutionTimes);

    const current7d =
        getTimeWindow(7, now);

    const current30d =
        getTimeWindow(30, now);

    const previous30d =
        getPreviousTimeWindow(30, now);

    const issuesCreatedLast7Days =
        issues.filter(issue =>
            isWithinWindow(
                issue.createdAtGithub,
                current7d
            )
        ).length;

    const issuesCreatedLast30Days =
        issues.filter(issue =>
            isWithinWindow(
                issue.createdAtGithub,
                current30d
            )
        ).length;

    const issuesCreatedPrevious30Days =
        issues.filter(issue =>
            isWithinWindow(
                issue.createdAtGithub,
                previous30d
            )
        ).length;

    const issuesClosedLast30Days =
        issues.filter(issue =>
            isWithinWindow(
                issue.closedAt,
                current30d
            )
        ).length;

    const backlogTrend =
        calculateTrend(
            issuesCreatedLast30Days,
            issuesCreatedPrevious30Days
        );

    const averageComments =
        calculateAverage(
            issues.map(issue => issue.comments || 0)
        );

    return {
        totalIssues,

        openIssues,

        closedIssues,

        closureRate: Number(
            closureRate.toFixed(2)
        ),

        averageResolutionTimeHours:
            Number(
                averageResolutionTime.toFixed(2)
            ),

        medianResolutionTimeHours:
            Number(
                medianResolutionTime.toFixed(2)
            ),

        issuesCreatedLast7Days,

        issuesCreatedLast30Days,

        issuesCreatedPrevious30Days,

        issuesClosedLast30Days,

        averageComments: Number(
            averageComments.toFixed(2)
        ),

        backlogTrend,
    };
}

function isWithinWindow(date, window) {
    if (!date) {
        return false;
    }

    const timestamp = new Date(date);

    return (
        timestamp >= window.start &&
        timestamp < window.end
    );
}

function calculateAverage(values) {
    if (values.length === 0) {
        return 0;
    }

    const sum = values.reduce(
        (total, value) => total + value,
        0
    );

    return sum / values.length;
}

function calculateMedian(values) {
    if (values.length === 0) {
        return 0;
    }

    const sorted = [...values].sort(
        (a, b) => a - b
    );

    const middle =
        Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (
            (sorted[middle - 1] +
                sorted[middle]) / 2
        );
    }

    return sorted[middle];
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