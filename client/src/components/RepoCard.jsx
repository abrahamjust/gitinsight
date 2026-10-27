import { useState } from "react";
import { CircleDot, GitFork, LoaderCircle, RefreshCw, Star, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { errorMessage } from "../api/client.js";
import { deleteRepository, getRepository } from "../api/repositories.js";
import { useRepositorySync } from "../hooks/useRepositorySync.js";
import { formatCompact, timeAgo } from "../lib/format.js";
import Avatar, { accentFor } from "./Avatar.jsx";
import { SyncPill } from "./StatusPill.jsx";

export default function RepoCard({ repository, onChange, onDeleted }) {
    const sync = useRepositorySync(repository, {
        onSettled: async () => {
            try {
                onChange(await getRepository(repository._id));
            } catch {
                // the card keeps showing the polled status
            }
        },
    });

    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    const handleDelete = async () => {
        setDeleting(true);
        setDeleteError(null);
        try {
            await deleteRepository(repository._id);
            onDeleted(repository._id);
        } catch (err) {
            setDeleteError(errorMessage(err, "Couldn't delete it."));
            setDeleting(false);
            setConfirming(false);
        }
    };

    const neverSynced = !sync.lastSynced;

    return (
        <article className={`repo-card card accent-band-${accentFor(repository.fullName)}`}>
            <header className="repo-card__head">
                <Avatar src={repository.ownerAvatar} name={repository.owner} size={44} square />
                <div className="repo-card__title">
                    <span className="repo-card__owner">{repository.owner}</span>
                    <h3>
                        <Link to={`/repos/${repository._id}`} className="stretched">
                            {repository.name}
                        </Link>
                    </h3>
                </div>
                <SyncPill status={sync.status} size="sm" />
            </header>

            <p className="repo-card__desc">
                {repository.description || <span className="muted">No description. Mysterious.</span>}
            </p>

            <ul className="repo-card__stats">
                {repository.language && (
                    <li>
                        <span className="lang-dot" aria-hidden="true" />
                        {repository.language}
                    </li>
                )}
                <li title="Stars">
                    <Star size={14} strokeWidth={2.4} aria-hidden="true" />
                    {formatCompact(repository.stars)}
                </li>
                <li title="Forks">
                    <GitFork size={14} strokeWidth={2.4} aria-hidden="true" />
                    {formatCompact(repository.forks)}
                </li>
                <li title="Open issues">
                    <CircleDot size={14} strokeWidth={2.4} aria-hidden="true" />
                    {formatCompact(repository.openIssues)}
                </li>
            </ul>

            <footer className="repo-card__foot">
                <span className="repo-card__synced muted">
                    {sync.status === "failed"
                        ? sync.syncError || "Last sync failed"
                        : sync.busy && neverSynced
                            ? sync.stalled
                                ? "Waiting for the sync worker…"
                                : "First sync in progress"
                            : `Synced ${timeAgo(sync.lastSynced)}`}
                </span>

                <div className="repo-card__actions">
                    {confirming ? (
                        <span className="confirm">
                            <span>Delete?</span>
                            <button
                                type="button"
                                className="btn btn--danger btn--xs"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? <LoaderCircle size={14} className="spin" /> : "Yes"}
                            </button>
                            <button
                                type="button"
                                className="btn btn--ghost btn--xs"
                                onClick={() => setConfirming(false)}
                                disabled={deleting}
                            >
                                No
                            </button>
                        </span>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="icon-btn icon-btn--sm"
                                onClick={sync.triggerSync}
                                disabled={sync.busy || sync.starting}
                                title={sync.busy ? "Sync in progress" : "Sync with GitHub"}
                            >
                                <RefreshCw
                                    size={16}
                                    strokeWidth={2.4}
                                    className={sync.busy || sync.starting ? "spin" : undefined}
                                    aria-hidden="true"
                                />
                                <span className="sr-only">Sync</span>
                            </button>
                            <button
                                type="button"
                                className="icon-btn icon-btn--sm icon-btn--danger"
                                onClick={() => setConfirming(true)}
                                title="Delete repository"
                            >
                                <Trash2 size={16} strokeWidth={2.4} aria-hidden="true" />
                                <span className="sr-only">Delete</span>
                            </button>
                        </>
                    )}
                </div>
            </footer>

            {(sync.error || deleteError) && (
                <p className="repo-card__error" role="alert">
                    {sync.error || deleteError}
                </p>
            )}
        </article>
    );
}
