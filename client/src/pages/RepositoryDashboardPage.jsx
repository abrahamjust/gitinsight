import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { errorMessage } from "../api/client.js";
import { getAnalytics, getRepository } from "../api/repositories.js";
import PulseLoader from "../components/PulseLoader.jsx";
import SyncProgress from "../components/SyncProgress.jsx";
import { useRepositorySync } from "../hooks/useRepositorySync.js";
import {
    ActivitySection,
    ContributorSection,
    IssueSection,
    PullRequestSection,
    ReleaseSection,
    ReviewSection,
} from "./dashboard/DeepDiveSections.jsx";
import InsightsSection from "./dashboard/InsightsSection.jsx";
import OverviewSection from "./dashboard/OverviewSection.jsx";
import RepoHeader from "./dashboard/RepoHeader.jsx";
import SectionNav from "./dashboard/SectionNav.jsx";
import SymptomsSection from "./dashboard/SymptomsSection.jsx";
import VitalsSection from "./dashboard/VitalsSection.jsx";
import NotFoundPage from "./NotFoundPage.jsx";

const ANALYSIS_LINES = [
    "Counting commits…",
    "Timing how long PRs sit around…",
    "Asking the issues how they feel…",
    "Estimating the bus factor…",
    "Checking who reviews what…",
    "Getting a second opinion from Gemini…",
];

const IMPORT_LINES = [
    "Fetching repository metadata…",
    "Pulling commits…",
    "Pulling pull requests and reviews…",
    "Pulling issues, contributors and releases…",
    "Big repos take a few minutes. Grab a coffee.",
];

export default function RepositoryDashboardPage() {
    const { id } = useParams();

    const [repository, setRepository] = useState(null);
    const [repoState, setRepoState] = useState("loading"); // loading | ready | missing | error
    const [repoError, setRepoError] = useState(null);

    const [analytics, setAnalytics] = useState(null);
    const [analyticsState, setAnalyticsState] = useState("idle"); // idle | loading | ready | error
    const [analyticsError, setAnalyticsError] = useState(null);

    const loadRepository = useCallback(async () => {
        try {
            const repo = await getRepository(id);
            setRepository(repo);
            setRepoState("ready");
            return repo;
        } catch (err) {
            if (err.response?.status === 404) {
                setRepoState("missing");
            } else {
                setRepoError(errorMessage(err, "Couldn't load this repository."));
                setRepoState("error");
            }
            return null;
        }
    }, [id]);

    const loadAnalytics = useCallback(async () => {
        setAnalyticsState("loading");
        setAnalyticsError(null);
        try {
            setAnalytics(await getAnalytics(id));
            setAnalyticsState("ready");
        } catch (err) {
            setAnalyticsError(errorMessage(err, "Couldn't generate analytics."));
            setAnalyticsState("error");
        }
    }, [id]);

    useEffect(() => {
        setRepoState("loading");
        setAnalytics(null);
        setAnalyticsState("idle");
        loadRepository();
    }, [loadRepository]);

    const sync = useRepositorySync(repository, {
        onSettled: async (status) => {
            await loadRepository();
            if (status.status === "completed") {
                loadAnalytics();
            }
        },
    });

    // Only analyse once there's synced data; analysing an empty repo would
    // still spend a Gemini call.
    const hasData = Boolean(sync.lastSynced) || sync.status === "completed";

    useEffect(() => {
        if (repoState === "ready" && hasData && analyticsState === "idle") {
            loadAnalytics();
        }
    }, [repoState, hasData, analyticsState, loadAnalytics]);

    const sections = useMemo(
        () => [
            { id: "overview", label: "Overview" },
            { id: "symptoms", label: "Symptoms", count: analytics?.bottlenecks?.total },
            { id: "second-opinion", label: "Second opinion" },
            { id: "vitals", label: "Vitals" },
            { id: "activity", label: "Pulse" },
            { id: "pull-requests", label: "PRs" },
            { id: "issues", label: "Issues" },
            { id: "contributors", label: "People" },
            { id: "reviews", label: "Reviews" },
            { id: "releases", label: "Releases" },
        ],
        [analytics?.bottlenecks?.total]
    );

    if (repoState === "loading") {
        return <PulseLoader lines={["Finding that repo…"]} />;
    }

    if (repoState === "missing") {
        return <NotFoundPage />;
    }

    if (repoState === "error") {
        return (
            <div className="empty card">
                <h2>That didn't load.</h2>
                <p className="muted">{repoError}</p>
                <button type="button" className="btn" onClick={loadRepository}>
                    <RefreshCw size={16} aria-hidden="true" /> Try again
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <Link to="/" className="back-link">
                <ArrowLeft size={16} strokeWidth={2.6} aria-hidden="true" /> All repos
            </Link>

            <RepoHeader repository={repository} sync={sync} />

            {!hasData ? (
                sync.status === "failed" ? (
                    <div className="card empty empty--wide">
                        <span className="empty__badge sticker accent-pink tilt-l">import failed</span>
                        <h2>The first sync didn't make it.</h2>
                        <p className="muted">
                            {sync.syncError || "GitHub may have rate-limited us."} Give it another go with
                            Sync now.
                        </p>
                    </div>
                ) : (
                    <div className="card importing">
                        <PulseLoader lines={IMPORT_LINES} interval={3200} />
                        <SyncProgress progress={sync.progress} />
                        <p className="muted importing__note">
                            This page updates by itself when the sync finishes.
                        </p>
                    </div>
                )
            ) : analyticsState === "error" && !analytics ? (
                <div className="card empty empty--wide">
                    <span className="empty__badge sticker accent-peach tilt-r">no diagnosis</span>
                    <h2>We couldn't finish the check-up.</h2>
                    <p className="muted">
                        {analyticsError} This usually means the AI service or Redis is unavailable.
                    </p>
                    <button type="button" className="btn btn--primary" onClick={loadAnalytics}>
                        <RefreshCw size={16} aria-hidden="true" /> Try again
                    </button>
                </div>
            ) : !analytics ? (
                <div className="card importing">
                    <PulseLoader lines={ANALYSIS_LINES} />
                    <p className="muted importing__note">
                        The first check-up takes a few seconds. After that it's cached for 10 minutes.
                    </p>
                </div>
            ) : (
                <>
                    {sync.busy ? (
                        <div className="banner banner--info" role="status">
                            Syncing with GitHub. The numbers below will refresh when it finishes.
                            {sync.progress && (
                                <>
                                    <br />
                                    <SyncProgress progress={sync.progress} inline />
                                </>
                            )}
                        </div>
                    ) : analyticsState === "loading" ? (
                        <div className="banner banner--info" role="status">
                            Fresh data is in. Re-running the check-up…
                        </div>
                    ) : analyticsState === "error" ? (
                        <div className="banner banner--error" role="alert">
                            Couldn't refresh the analytics ({analyticsError}). Showing the previous results.{" "}
                            <button type="button" className="link-button" onClick={loadAnalytics}>
                                Retry
                            </button>
                        </div>
                    ) : null}

                    <SectionNav sections={sections} />

                    <OverviewSection analytics={analytics} />
                    <SymptomsSection bottlenecks={analytics.bottlenecks} />
                    <InsightsSection explanation={analytics.aiExplanation} error={analytics.aiError} />
                    <VitalsSection health={analytics.health} />
                    <ActivitySection
                        activity={analytics.activity}
                        collaboration={analytics.collaboration}
                        issues={analytics.issues}
                    />
                    <PullRequestSection collaboration={analytics.collaboration} />
                    <IssueSection issues={analytics.issues} />
                    <ContributorSection contributors={analytics.contributors} />
                    <ReviewSection reviews={analytics.pullRequestReviews} />
                    <ReleaseSection releases={analytics.releases} />
                </>
            )}
        </div>
    );
}
