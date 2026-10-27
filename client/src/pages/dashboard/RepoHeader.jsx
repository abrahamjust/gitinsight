import {
    CircleDot,
    ExternalLink,
    Eye,
    GitBranch,
    GitFork,
    LoaderCircle,
    RefreshCw,
    Star,
} from "lucide-react";

import Avatar from "../../components/Avatar.jsx";
import { SyncPill } from "../../components/StatusPill.jsx";
import { formatCompact, formatDate, timeAgo } from "../../lib/format.js";

export default function RepoHeader({ repository, sync }) {
    return (
        <header className="repo-head card">
            <div className="repo-head__main">
                <Avatar src={repository.ownerAvatar} name={repository.owner} size={64} square />
                <div className="repo-head__titles">
                    <span className="repo-head__owner">{repository.owner} /</span>
                    <h1>{repository.name}</h1>
                    {repository.description && <p className="repo-head__desc">{repository.description}</p>}
                    {repository.topics?.length > 0 && (
                        <ul className="chips">
                            {repository.topics.slice(0, 8).map((topic) => (
                                <li key={topic} className="chip">
                                    {topic}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <ul className="repo-head__meta">
                {repository.language && (
                    <li>
                        <span className="lang-dot" aria-hidden="true" />
                        {repository.language}
                    </li>
                )}
                <li>
                    <Star size={15} strokeWidth={2.4} aria-hidden="true" />
                    <b className="tnum">{formatCompact(repository.stars)}</b> stars
                </li>
                <li>
                    <GitFork size={15} strokeWidth={2.4} aria-hidden="true" />
                    <b className="tnum">{formatCompact(repository.forks)}</b> forks
                </li>
                <li>
                    <Eye size={15} strokeWidth={2.4} aria-hidden="true" />
                    <b className="tnum">{formatCompact(repository.watchers)}</b> watchers
                </li>
                <li>
                    <CircleDot size={15} strokeWidth={2.4} aria-hidden="true" />
                    <b className="tnum">{formatCompact(repository.openIssues)}</b> open issues
                </li>
                <li>
                    <GitBranch size={15} strokeWidth={2.4} aria-hidden="true" />
                    {repository.defaultBranch}
                </li>
                {repository.createdAtGithub && <li className="muted">since {formatDate(repository.createdAtGithub)}</li>}
            </ul>

            <div className="repo-head__sync">
                <div className="repo-head__sync-status">
                    <SyncPill status={sync.status} />
                    <span className="muted">
                        {sync.lastSynced ? `Last synced ${timeAgo(sync.lastSynced)}` : "Not synced yet"}
                    </span>
                </div>
                <div className="repo-head__buttons">
                    <a className="btn btn--ghost" href={repository.url} target="_blank" rel="noreferrer">
                        GitHub <ExternalLink size={15} strokeWidth={2.4} aria-hidden="true" />
                    </a>
                    <button
                        type="button"
                        className="btn btn--primary"
                        onClick={sync.triggerSync}
                        disabled={sync.busy || sync.starting}
                    >
                        {sync.busy || sync.starting ? (
                            <LoaderCircle size={16} className="spin" aria-hidden="true" />
                        ) : (
                            <RefreshCw size={16} strokeWidth={2.6} aria-hidden="true" />
                        )}
                        {sync.busy ? "Syncing…" : "Sync now"}
                    </button>
                </div>
                {sync.error && (
                    <p className="repo-head__note is-error" role="alert">
                        {sync.error}
                    </p>
                )}
                {sync.status === "failed" && sync.syncError && (
                    <p className="repo-head__note is-error">Last sync failed: {sync.syncError}</p>
                )}
                {sync.stalled && (
                    <p className="repo-head__note">
                        Still queued. Make sure the sync worker is running (
                        <code>node src/workers/repositorySyncWorker.js</code>).
                    </p>
                )}
            </div>
        </header>
    );
}
