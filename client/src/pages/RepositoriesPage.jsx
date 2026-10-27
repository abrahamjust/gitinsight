import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";

import { errorMessage } from "../api/client.js";
import { listRepositories } from "../api/repositories.js";
import ImportBar from "../components/ImportBar.jsx";
import PulseLoader from "../components/PulseLoader.jsx";
import RepoCard from "../components/RepoCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatCompact } from "../lib/format.js";

const SORTS = {
    recent: { label: "Recently added", compare: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) },
    name: { label: "Name", compare: (a, b) => a.fullName.localeCompare(b.fullName) },
    stars: { label: "Stars", compare: (a, b) => (b.stars || 0) - (a.stars || 0) },
};

function greeting() {
    const hour = new Date().getHours();
    if (hour < 5) return "Burning the midnight oil";
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

export default function RepositoriesPage() {
    const { user } = useAuth();
    const [repositories, setRepositories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("recent");

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setRepositories(await listRepositories());
        } catch (err) {
            setError(errorMessage(err, "Couldn't load your repositories."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const visible = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return repositories
            .filter(
                (repo) =>
                    !needle ||
                    repo.fullName.toLowerCase().includes(needle) ||
                    repo.description?.toLowerCase().includes(needle) ||
                    repo.language?.toLowerCase().includes(needle)
            )
            .sort(SORTS[sort].compare);
    }, [repositories, query, sort]);

    const totals = useMemo(
        () => ({
            synced: repositories.filter((r) => r.analyticsStatus === "completed").length,
            stars: repositories.reduce((sum, r) => sum + (r.stars || 0), 0),
        }),
        [repositories]
    );

    const handleImported = (repo) => setRepositories((list) => [repo, ...list]);
    const handleChange = (repo) =>
        setRepositories((list) => list.map((r) => (r._id === repo._id ? repo : r)));
    const handleDeleted = (id) => setRepositories((list) => list.filter((r) => r._id !== id));

    return (
        <div className="shelf">
            <section className="shelf__hero">
                <div className="shelf__intro">
                    <span className="eyebrow">{greeting()}, {user?.username}</span>
                    <h1>
                        Your repo <span className="highlight">shelf</span>
                    </h1>
                    <p className="muted">
                        Paste a public GitHub repo below. We'll pull its history, run the numbers, and
                        tell you how it's really doing.
                    </p>
                </div>

                <dl className="shelf__counters">
                    <div className="counter sticker accent-sun tilt-r">
                        <dt>repos</dt>
                        <dd className="tnum">{repositories.length}</dd>
                    </div>
                    <div className="counter sticker accent-lime tilt-l">
                        <dt>synced</dt>
                        <dd className="tnum">{totals.synced}</dd>
                    </div>
                    <div className="counter sticker accent-pink tilt-r2">
                        <dt>stars</dt>
                        <dd className="tnum">{formatCompact(totals.stars)}</dd>
                    </div>
                </dl>
            </section>

            <ImportBar onImported={handleImported} />

            {loading ? (
                <PulseLoader lines={["Dusting off your shelf…"]} />
            ) : error ? (
                <div className="empty card">
                    <h2>Hmm, that didn't load.</h2>
                    <p className="muted">{error}</p>
                    <button type="button" className="btn" onClick={load}>
                        <RefreshCw size={16} aria-hidden="true" /> Try again
                    </button>
                </div>
            ) : repositories.length === 0 ? (
                <div className="empty card empty--shelf">
                    <span className="empty__badge sticker accent-sky tilt-l">0 repos</span>
                    <h2>An empty shelf. Very minimalist.</h2>
                    <p className="muted">
                        Import your first repository above. The first sync runs in the background, so
                        bigger repos can take a few minutes.
                    </p>
                </div>
            ) : (
                <>
                    <div className="toolbar">
                        <label className="search">
                            <Search size={16} strokeWidth={2.4} aria-hidden="true" />
                            <span className="sr-only">Filter repositories</span>
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Filter by name, language…"
                            />
                        </label>
                        <div className="segmented" role="radiogroup" aria-label="Sort by">
                            {Object.entries(SORTS).map(([key, { label }]) => (
                                <button
                                    key={key}
                                    type="button"
                                    role="radio"
                                    aria-checked={sort === key}
                                    className={sort === key ? "is-on" : ""}
                                    onClick={() => setSort(key)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {visible.length === 0 ? (
                        <p className="muted shelf__nomatch">Nothing matches “{query}”.</p>
                    ) : (
                        <div className="repo-grid">
                            {visible.map((repo) => (
                                <RepoCard
                                    key={repo._id}
                                    repository={repo}
                                    onChange={handleChange}
                                    onDeleted={handleDeleted}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
