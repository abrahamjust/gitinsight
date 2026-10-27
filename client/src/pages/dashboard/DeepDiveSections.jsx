import Momentum from "../../components/charts/Momentum.jsx";
import StackedBar from "../../components/charts/StackedBar.jsx";
import {
    formatDays,
    formatHours,
    formatNumber,
    formatPercent,
} from "../../lib/format.js";
import { Section, Stat, StatGrid } from "./Panel.jsx";

const count = (value) => (Array.isArray(value) ? value.length : value ?? 0);

export function ActivitySection({ activity, collaboration, issues }) {
    return (
        <Section id="activity" eyebrow="Commits & momentum" title="Pulse">
            <div className="panel-grid">
                <div className="card panel">
                    <StatGrid>
                        <Stat label="Total commits" value={formatNumber(activity.totalCommits)} emphasis />
                        <Stat label="Last 7 days" value={formatNumber(activity.commitsLast7Days)} />
                        <Stat label="Per week" value={formatNumber(activity.commitsPerWeek, 1)} hint="last 30 days" />
                        <Stat
                            label="Active contributors"
                            value={formatNumber(activity.activeContributors)}
                            hint={`of ${formatNumber(activity.totalContributors)} total`}
                        />
                        <Stat
                            label="Longest quiet stretch"
                            value={formatDays(activity.longestInactivityDays)}
                            hint="between two commits"
                        />
                    </StatGrid>
                </div>
                <div className="card panel">
                    <h3 className="panel__title">Last 30 days vs the 30 before</h3>
                    <div className="momentum-grid">
                        <Momentum
                            title="Commits"
                            previous={activity.commitsPrevious30Days}
                            current={activity.commitsLast30Days}
                            trend={activity.trend}
                        />
                        <Momentum
                            title="PRs opened"
                            previous={collaboration.prsPrevious30Days}
                            current={collaboration.prsLast30Days}
                            trend={collaboration.activityTrend}
                        />
                        <Momentum
                            title="Issues opened"
                            previous={issues.issuesCreatedPrevious30Days}
                            current={issues.issuesCreatedLast30Days}
                            trend={issues.backlogTrend}
                            goodDirection="down"
                        />
                    </div>
                </div>
            </div>
        </Section>
    );
}

export function PullRequestSection({ collaboration: pr }) {
    const closedUnmerged = Math.max(0, pr.closedPRs - pr.mergedPRs);

    return (
        <Section id="pull-requests" eyebrow="Collaboration" title="Pull requests">
            <div className="panel-grid">
                <div className="card panel">
                    <h3 className="panel__title">
                        Where {formatNumber(pr.totalPRs)} PRs ended up
                    </h3>
                    <StackedBar
                        label="Pull requests by outcome"
                        emptyText="No pull requests imported."
                        segments={[
                            { key: "merged", label: "Merged", value: pr.mergedPRs, color: "var(--c1)" },
                            { key: "open", label: "Still open", value: pr.openPRs, color: "var(--c2)" },
                            { key: "closed", label: "Closed without merge", value: closedUnmerged, color: "var(--c3)" },
                        ]}
                    />
                </div>
                <div className="card panel">
                    <StatGrid>
                        <Stat label="Merge rate" value={formatPercent(pr.mergeRate)} hint="of closed PRs" emphasis />
                        <Stat label="Median time to merge" value={formatHours(pr.medianTimeToMerge)} />
                        <Stat label="Average time to merge" value={formatHours(pr.averageTimeToMerge)} />
                        <Stat label="Median PR size" value={`${formatNumber(pr.medianPRSize)}`} hint="lines changed" />
                        <Stat label="Median files changed" value={formatNumber(pr.medianChangedFiles, 1)} />
                        <Stat label="PRs per week" value={formatNumber(pr.prsPerWeek, 1)} hint={`${formatNumber(pr.prsLast7Days)} in last 7 days`} />
                    </StatGrid>
                </div>
            </div>
        </Section>
    );
}

export function IssueSection({ issues }) {
    return (
        <Section id="issues" eyebrow="Triage" title="Issues">
            <div className="panel-grid">
                <div className="card panel">
                    <h3 className="panel__title">{formatNumber(issues.totalIssues)} issues, by state</h3>
                    <StackedBar
                        label="Issues by state"
                        emptyText="No issues imported."
                        segments={[
                            { key: "closed", label: "Closed", value: issues.closedIssues, color: "var(--c1)" },
                            { key: "open", label: "Open", value: issues.openIssues, color: "var(--c2)" },
                        ]}
                    />
                </div>
                <div className="card panel">
                    <StatGrid>
                        <Stat label="Closure rate" value={formatPercent(issues.closureRate)} emphasis />
                        <Stat label="Median resolution" value={formatHours(issues.medianResolutionTimeHours)} />
                        <Stat label="Average resolution" value={formatHours(issues.averageResolutionTimeHours)} />
                        <Stat label="Comments per issue" value={formatNumber(issues.averageComments, 1)} />
                        <Stat label="Opened last 7 days" value={formatNumber(issues.issuesCreatedLast7Days)} />
                        <Stat label="Closed last 30 days" value={formatNumber(issues.issuesClosedLast30Days)} />
                    </StatGrid>
                </div>
            </div>
        </Section>
    );
}

export function ContributorSection({ contributors: c }) {
    const total = c.totalContributions || 0;
    const top = c.topContributor?.contributions ?? 0;
    const topThree = Math.round((total * (c.topThreeContributorShare || 0)) / 100);
    const nextTwo = Math.max(0, topThree - top);
    const rest = Math.max(0, total - top - nextTwo);

    return (
        <Section id="contributors" eyebrow="Who does the work" title="People">
            <div className="panel-grid">
                <div className="card panel">
                    <h3 className="panel__title">Who wrote the {formatNumber(total)} contributions</h3>
                    <StackedBar
                        label="Contribution share"
                        emptyText="No contributor data imported."
                        segments={[
                            {
                                key: "top",
                                label: c.topContributor ? `@${c.topContributor.login}` : "Top contributor",
                                value: top,
                                color: "var(--c1)",
                            },
                            { key: "next", label: "Next two", value: nextTwo, color: "var(--c2)" },
                            { key: "rest", label: "Everyone else", value: rest, color: "var(--c-muted)" },
                        ]}
                    />
                </div>
                <div className="card panel bus-factor">
                    <div className="bus-factor__hero">
                        <span className="bus-factor__number tnum">{formatNumber(c.estimatedBusFactor)}</span>
                        <div>
                            <h3>Bus factor</h3>
                            <p className="muted">
                                The fewest people who together wrote half of all contributions.
                                Higher means the project survives someone leaving.
                            </p>
                        </div>
                    </div>
                    <StatGrid>
                        <Stat label="Contributors" value={formatNumber(c.totalContributors)} />
                        <Stat label="Top contributor share" value={formatPercent(c.topContributorShare)} />
                        <Stat label="Top 3 share" value={formatPercent(c.topThreeContributorShare)} />
                        <Stat label="Concentration (HHI)" value={formatNumber(c.concentrationHHI, 2)} hint="0 = spread out, 1 = one person" />
                    </StatGrid>
                </div>
            </div>
        </Section>
    );
}

export function ReviewSection({ reviews: r }) {
    return (
        <Section id="reviews" eyebrow="Second eyes" title="Reviews">
            <div className="panel-grid">
                <div className="card panel">
                    <h3 className="panel__title">{formatNumber(r.totalReviews)} reviews, by verdict</h3>
                    <StackedBar
                        label="Reviews by state"
                        emptyText="No reviews imported."
                        segments={[
                            { key: "approved", label: "Approved", value: r.approvedReviews, color: "var(--c1)" },
                            { key: "commented", label: "Commented", value: r.commentedReviews, color: "var(--c2)" },
                            { key: "changes", label: "Changes requested", value: r.changesRequested, color: "var(--c3)" },
                            { key: "dismissed", label: "Dismissed", value: r.dismissedReviews, color: "var(--c4)" },
                        ]}
                    />
                </div>
                <div className="card panel">
                    <StatGrid>
                        <Stat
                            label="Review coverage"
                            value={formatPercent(r.reviewCoverage)}
                            hint={`${formatNumber(r.prsWithoutReview)} PRs never reviewed`}
                            emphasis
                        />
                        <Stat label="Median to first review" value={formatHours(r.medianTimeToFirstReviewHours)} />
                        <Stat label="Average to first review" value={formatHours(r.averageTimeToFirstReviewHours)} />
                        <Stat label="Unique reviewers" value={formatNumber(r.uniqueReviewers)} />
                        <Stat
                            label="Top reviewer"
                            value={r.topReviewer ? `@${r.topReviewer.login}` : "—"}
                            hint={r.topReviewer ? `${formatNumber(r.topReviewer.reviews)} reviews` : undefined}
                        />
                        <Stat label="Reviewer concentration" value={formatNumber(r.reviewerConcentration, 2)} hint="0 = spread out, 1 = one person" />
                    </StatGrid>
                </div>
            </div>
        </Section>
    );
}

export function ReleaseSection({ releases: rel }) {
    // interval stats need at least two published releases; the backend reports 0 otherwise
    const interval = (days) => (rel.publishedReleases < 2 ? "—" : formatDays(days));

    return (
        <Section id="releases" eyebrow="Shipping" title="Releases">
            <div className="card panel">
                {rel.totalReleases === 0 ? (
                    <p className="chart-empty">
                        No releases on GitHub. Plenty of projects ship from main, so this dimension isn't scored.
                    </p>
                ) : (
                    <StatGrid>
                        <Stat label="Total releases" value={formatNumber(rel.totalReleases)} emphasis />
                        <Stat label="Since latest release" value={formatDays(rel.latestReleaseAgeDays)} />
                        <Stat label="Last 30 days" value={formatNumber(rel.releasesLast30Days)} />
                        <Stat label="Last 90 days" value={formatNumber(rel.releasesLast90Days)} />
                        <Stat label="Median interval" value={interval(rel.medianReleaseIntervalDays)} />
                        <Stat label="Average interval" value={interval(rel.averageReleaseIntervalDays)} />
                        <Stat label="Longest gap" value={interval(rel.longestReleaseGapDays)} />
                        <Stat
                            label="Pre-releases · drafts"
                            value={`${formatNumber(count(rel.prereleases))} · ${formatNumber(count(rel.draftReleases))}`}
                        />
                    </StatGrid>
                )}
            </div>
        </Section>
    );
}
