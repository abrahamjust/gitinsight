export { calculateReleases };

function calculateReleases(releases, now = new Date()) {
    const totalReleases = releases.length;
    const publishedReleases = releases.filter(
        release => release.publishedAtGithub
    );
    const draftReleases = releases.filter(
        release => release.draft
    );
    const prereleases = releases.filter(
        release => release.prerelease
    );
    const publishedDates = publishedReleases
        .map(release => new Date(release.publishedAtGithub))
        .filter(date => !Number.isNaN(date.getTime()))
        .sort((a, b) => a - b);
    const releasesLast30Days = publishedDates
    .filter(date => isWithinDays(date, now, 30)
    ).length;
    const releasesLast90Days = publishedDates
    .filter(date => isWithinDays(date, now, 90)
    ).length;

    const intervals = [];

    for (let i = 1; i < publishedDates.length; i++) {
        const previous = publishedDates[i - 1];
        const current = publishedDates[i];
        const interval = (current - previous) / (1000 * 60 * 60 * 24);
        intervals.push(interval);
    }

    const averageReleaseInterval = calculateAverage(intervals);
    const medianReleaseInterval = calculateMedian(intervals);
    const longestReleaseGap = intervals.length > 0 ? Math.max(...intervals) : 0;
    const latestReleaseAge = publishedDates.length > 0 ? (
        (now - publishedDates[publishedDates.length - 1]) /
        (1000 * 60 * 60 * 24)
    ) : null;

    return {
        totalReleases,
        publishedReleases: publishedReleases.length,
        draftReleases,
        prereleases,
        releasesLast30Days,
        releasesLast90Days,
        averageReleaseIntervalDays: Number(averageReleaseInterval.toFixed(2)),
        medianReleaseIntervalDays: Number(medianReleaseInterval.toFixed(2)),
        longestReleaseGapDays: Number(longestReleaseGap.toFixed(2)),
        latestReleaseAgeDays: latestReleaseAge === null ? null : Number(latestReleaseAge.toFixed(2)),
    };
}

function isWithinDays(date, now, days) {
    const difference = now - date;
    return (
        difference >= 0 && difference <= days * 24 * 60 * 60 * 1000
    );
}

function calculateAverage(values) {
    if (values.length === 0) {
        return 0;
    }
    const sum = values.reduce((total, value) => total + value, 0);
    return sum / values.length;
}

function calculateMedian(values) {
    if (values.length === 0) {
        return 0;
    }
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (
            (sorted[middle-1] + sorted[middle]) / 2
        );
    }
    return sorted[middle];
}
