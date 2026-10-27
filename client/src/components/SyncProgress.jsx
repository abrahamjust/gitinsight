import { CircleDot, GitCommitHorizontal, GitPullRequest, Package, Users } from "lucide-react";

import { formatNumber } from "../lib/format.js";

// keys match the worker's progress payload
const RESOURCES = [
    { key: "commits", label: "commits", icon: GitCommitHorizontal },
    { key: "pullRequests", label: "pull requests", icon: GitPullRequest },
    { key: "issues", label: "issues", icon: CircleDot },
    { key: "contributors", label: "contributors", icon: Users },
    { key: "releases", label: "releases", icon: Package },
];

/**
 * Live counts of what the sync worker has fetched so far. GitHub doesn't say
 * how many items there are in total, so this shows counts, not a percentage.
 */
export default function SyncProgress({ progress, inline = false }) {
    if (!progress) return null;

    if (inline) {
        return (
            <span className="sync-progress-inline tnum">
                {RESOURCES.filter(({ key }) => progress[key] > 0)
                    .map(({ key, label }) => `${formatNumber(progress[key])} ${label}`)
                    .join(" · ")}
            </span>
        );
    }

    return (
        <ul className="sync-progress" aria-label="Fetched so far">
            {RESOURCES.map(({ key, label, icon: Icon }) => {
                const count = progress[key] ?? 0;
                return (
                    <li key={key} className={count > 0 ? "has-items" : ""}>
                        <Icon size={16} strokeWidth={2.4} aria-hidden="true" />
                        <span className="sync-progress__count tnum">{formatNumber(count)}</span>
                        <span className="sync-progress__label">{label}</span>
                    </li>
                );
            })}
        </ul>
    );
}
