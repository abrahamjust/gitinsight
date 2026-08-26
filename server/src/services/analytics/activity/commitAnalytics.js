import {
    getTimeWindow,
    getPreviousTimeWindow,
} from "../utils/timeWindow.js";

export {
    calculateActivity,
}

function calculateActivity (commits, contributors, now = new Date()) {
    const totalCommits = commits.length;

    const current7d = getTimeWindow(7, now);
    const current30d = getTimeWindow(30, now);
    const previous30d = getPreviousTimeWindow(30, now);

    const commitsLast7Days = commits.filter(commit => isWithinWindow(commit.committedAt, current7d)).length;
    const commitsLast30Days = commits.filter(commit => isWithinWindow(commit.committedAt, current30d)).length;
    const commitsPrevious30Days = commits.filter(commit => isWithinWindow(commit.committedAt, previous30d)).length;

    const longestInactivityDays = calculateLongestInactivity(commits);

    const totalContributors = contributors.length;

    const activeContributors = new Set(
        commits
        .filter(commit => isWithinWindow(commit.committedAt, current30d))
        .map(commit => commit.author?.login)
        .filter(Boolean)
    ).size;

    const commitsPerWeek = commitsLast30Days / 4.2857;

    const trend = calculateTrend(
        commitsLast30Days,
        commitsPrevious30Days
    );

    return {
        totalCommits,
        commitsLast7Days,
        commitsLast30Days,
        commitsPrevious30Days,
        commitsPerWeek: Number(
            commitsPerWeek.toFixed(2)
        ),
        totalContributors,
        activeContributors,
        longestInactivityDays,
        trend,
    };
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

function calculateTrend (current, previous) {
    if (previous === 0) {
        
        if (current == 0) {
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

    const changePercent = ((current - previous) / previous) * 100;

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

function calculateLongestInactivity (commits) {
    if (commits.length < 2) {
        return 0;
    }

    const sortedCommits = [...commits]
        .filter(commit => commit.committedAt)
        .sort((a, b) => new Date(a.committedAt) - new Date(b.committedAt));
    
    let longestGap = 0;

    for (let i = 1; i < sortedCommits.length; i++) {
        const previous = new Date(sortedCommits[i - 1].committedAt);
        const current = new Date(sortedCommits[i].committedAt);

        const gap = (current - previous) / (1000 * 60 * 60 * 24);

        longestGap = Math.max(longestGap, gap);
    }
    return Number(longestGap.toFixed(2));
}