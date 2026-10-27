import { useCallback, useEffect, useRef, useState } from "react";

import { getSyncStatus, startSync } from "../api/repositories.js";
import { errorMessage } from "../api/client.js";

const POLL_INTERVAL_MS = 4000;
// a job sitting in "pending" this long usually means the worker isn't running
const STALL_AFTER_MS = 25000;

const isBusy = (status) => status === "pending" || status === "processing";

function snapshot(repository) {
    return {
        status: repository?.analyticsStatus ?? "pending",
        lastSynced: repository?.lastSynced ?? null,
        syncError: repository?.syncError ?? null,
        // items fetched so far per resource, while a sync runs
        progress: null,
    };
}

/**
 * Tracks a repository's background sync: polls /sync-status while a job is
 * pending or processing, and calls onSettled once it completes or fails.
 */
export function useRepositorySync(repository, { onSettled } = {}) {
    const id = repository?._id;

    const [sync, setSync] = useState(() => snapshot(repository));
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState(null);
    const [stalled, setStalled] = useState(false);

    const onSettledRef = useRef(onSettled);
    onSettledRef.current = onSettled;

    useEffect(() => {
        setSync(snapshot(repository));
    }, [id, repository?.analyticsStatus, repository?.lastSynced, repository?.syncError]);

    const busy = isBusy(sync.status);

    useEffect(() => {
        if (!id || !busy) {
            return undefined;
        }

        let cancelled = false;

        const poll = async () => {
            try {
                const next = await getSyncStatus(id);
                if (cancelled) return;

                setSync({
                    status: next.status,
                    lastSynced: next.lastSynced,
                    syncError: next.syncError,
                    progress: next.progress ?? null,
                });

                if (!isBusy(next.status)) {
                    onSettledRef.current?.(next);
                }
            } catch {
                // transient failure: try again on the next tick
            }
        };

        const interval = setInterval(poll, POLL_INTERVAL_MS);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [id, busy]);

    useEffect(() => {
        setStalled(false);
        if (sync.status !== "pending") {
            return undefined;
        }
        const timer = setTimeout(() => setStalled(true), STALL_AFTER_MS);
        return () => clearTimeout(timer);
    }, [sync.status]);

    const triggerSync = useCallback(async () => {
        if (!id) return;

        setStarting(true);
        setError(null);

        try {
            await startSync(id);
            setSync((current) => ({ ...current, status: "pending", syncError: null }));
        } catch (err) {
            if (err.response?.status === 409) {
                // already running somewhere: just start watching it
                setSync((current) => ({
                    ...current,
                    status: err.response.data?.status ?? "processing",
                }));
            } else {
                setError(errorMessage(err, "Couldn't start the sync."));
            }
        } finally {
            setStarting(false);
        }
    }, [id]);

    return {
        ...sync,
        busy,
        stalled,
        starting,
        error,
        triggerSync,
    };
}
