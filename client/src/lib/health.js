import {
    Activity,
    CircleDot,
    Eye,
    GitPullRequest,
    Package,
    Users,
} from "lucide-react";

import {
    formatDays,
    formatHours,
    formatNumber,
    formatPercent,
    formatSignedPercent,
} from "./format.js";

export { STATUS, DIMENSIONS, DIMENSION_ORDER, METRICS, formatMetric, formatEvidence, statusOf };

// Mirrors server/src/services/health/status.js
const STATUS = {
    excellent: { label: "Excellent", short: "A+", mood: "Thriving" },
    good: { label: "Good", short: "Good", mood: "Doing fine" },
    warning: { label: "Warning", short: "Meh", mood: "Needs attention" },
    critical: { label: "Critical", short: "Ouch", mood: "In trouble" },
    not_applicable: { label: "No data", short: "n/a", mood: "Not enough data" },
};

function statusOf(status) {
    return STATUS[status] ? status : "not_applicable";
}

const DIMENSIONS = {
    activity: {
        label: "Activity",
        nickname: "Pulse",
        icon: Activity,
        blurb: "How often code actually lands.",
    },
    collaboration: {
        label: "Collaboration",
        nickname: "Teamwork",
        icon: GitPullRequest,
        blurb: "How pull requests move from open to merged.",
    },
    issues: {
        label: "Issues",
        nickname: "Triage",
        icon: CircleDot,
        blurb: "How quickly reported problems get closed.",
    },
    contributors: {
        label: "Contributors",
        nickname: "People",
        icon: Users,
        blurb: "How spread out the work is across people.",
    },
    releases: {
        label: "Releases",
        nickname: "Shipping",
        icon: Package,
        blurb: "How regularly versions get published.",
    },
    reviews: {
        label: "Reviews",
        nickname: "Second eyes",
        icon: Eye,
        blurb: "How much code gets looked at before merging.",
    },
};

const DIMENSION_ORDER = Object.keys(DIMENSIONS);

// Keys match the metric names in each health dimension and in bottleneck evidence
const METRICS = {
    commitsLast30Days: { label: "Commits in last 30 days", format: formatNumber },
    commitsPerWeek: { label: "Commits per week", format: (v) => formatNumber(v, 1) },
    longestInactivityDays: { label: "Longest quiet stretch", format: formatDays },
    trend: { label: "30-day commit trend", format: formatSignedPercent },
    changePercent: { label: "Change vs previous 30 days", format: formatSignedPercent },

    mergeRate: { label: "Merge rate", format: (v) => formatPercent(v) },
    medianTimeToMergeHours: { label: "Median time to merge", format: formatHours },
    medianPRSize: { label: "Median PR size", format: (v) => `${formatNumber(v)} lines` },
    totalPRs: { label: "Total PRs", format: formatNumber },
    mergedPRs: { label: "Merged PRs", format: formatNumber },

    closureRate: { label: "Issue closure rate", format: (v) => formatPercent(v) },
    medianResolutionTimeHours: { label: "Median resolution time", format: formatHours },
    averageComments: { label: "Comments per issue", format: (v) => formatNumber(v, 1) },
    backlogTrend: { label: "New-issue trend", format: formatSignedPercent },
    openIssues: { label: "Open issues", format: formatNumber },
    closedIssues: { label: "Closed issues", format: formatNumber },

    busFactor: { label: "Bus factor", format: formatNumber },
    topContributorShare: { label: "Top contributor share", format: (v) => formatPercent(v) },
    topThreeContributorShare: { label: "Top 3 share", format: (v) => formatPercent(v) },
    concentrationHHI: { label: "Concentration (HHI)", format: (v) => formatNumber(v, 2) },
    totalContributors: { label: "Contributors", format: formatNumber },

    releasesLast90Days: { label: "Releases in last 90 days", format: formatNumber },
    medianReleaseIntervalDays: { label: "Median release interval", format: formatDays },
    longestReleaseGapDays: { label: "Longest release gap", format: formatDays },
    latestReleaseAgeDays: { label: "Since latest release", format: formatDays },

    reviewCoverage: { label: "Review coverage", format: (v) => formatPercent(v) },
    medianTimeToFirstReviewHours: { label: "Median time to first review", format: formatHours },
    reviewerConcentration: { label: "Reviewer concentration", format: (v) => formatNumber(v, 2) },
    uniqueReviewers: { label: "Unique reviewers", format: formatNumber },
    reviewedPRs: { label: "Reviewed PRs", format: formatNumber },
    prsWithoutReview: { label: "PRs without review", format: formatNumber },
};

function humanize(key) {
    return key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, (c) => c.toUpperCase());
}

function formatMetric(key, value) {
    const metric = METRICS[key];
    return {
        label: metric?.label ?? humanize(key),
        value: metric ? metric.format(value) : formatNumber(value, 2),
    };
}

// Bottleneck evidence is a flat object; some values are { login, contributions|reviews }
function formatEvidence(evidence = {}) {
    return Object.entries(evidence).map(([key, value]) => {
        if (value && typeof value === "object" && value.login) {
            const count = value.contributions ?? value.reviews;
            return {
                key,
                label: METRICS[key]?.label ?? humanize(key),
                value: `@${value.login}${count !== undefined ? ` · ${formatNumber(count)}` : ""}`,
            };
        }

        return { key, ...formatMetric(key, value) };
    });
}
