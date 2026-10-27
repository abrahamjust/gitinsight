import { useState } from "react";
import { ArrowRight, Github, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { errorMessage } from "../api/client.js";
import { importRepository, normalizeRepositoryUrl } from "../api/repositories.js";
import { useAuth } from "../context/AuthContext.jsx";

const EXAMPLES = ["facebook/react", "vitejs/vite", "expressjs/express"];

export default function ImportBar({ onImported }) {
    const { user } = useAuth();
    const [value, setValue] = useState("");
    const [busy, setBusy] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const submit = async (event) => {
        event.preventDefault();
        const url = normalizeRepositoryUrl(value);

        if (!url) {
            setFeedback({
                tone: "error",
                text: "That doesn't look like a GitHub repo. Try owner/repo or a github.com link.",
            });
            return;
        }

        setBusy(true);
        setFeedback(null);

        try {
            const repository = await importRepository(url);
            onImported(repository);
            setValue("");
            setFeedback({
                tone: "success",
                text: `${repository.fullName} is on the shelf. Its first sync is running in the background.`,
            });
        } catch (err) {
            const existing = err.response?.status === 409 ? err.response.data?.repository : null;

            if (existing && String(existing.userId) === String(user?._id)) {
                setFeedback({ tone: "info", text: "Already on your shelf.", repoId: existing._id });
            } else if (existing) {
                setFeedback({
                    tone: "error",
                    text: "Another account has already imported this repository.",
                });
            } else {
                setFeedback({
                    tone: "error",
                    text: errorMessage(
                        err,
                        "Couldn't import that one. Make sure it's a public repository."
                    ),
                });
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="import">
            <form className="import__form" onSubmit={submit}>
                <label className="import__field">
                    <Github size={20} strokeWidth={2.2} aria-hidden="true" />
                    <span className="sr-only">GitHub repository URL</span>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="github.com/owner/repo  or just  owner/repo"
                        spellCheck="false"
                        autoCapitalize="off"
                        autoComplete="off"
                    />
                </label>
                <button type="submit" className="btn btn--sun btn--lg" disabled={busy || !value.trim()}>
                    {busy ? (
                        <>
                            <LoaderCircle size={18} className="spin" aria-hidden="true" /> Fetching…
                        </>
                    ) : (
                        <>
                            Import <ArrowRight size={18} strokeWidth={2.6} aria-hidden="true" />
                        </>
                    )}
                </button>
            </form>

            <div className="import__meta">
                {feedback ? (
                    <p className={`import__feedback is-${feedback.tone}`} role="status">
                        {feedback.text}
                        {feedback.repoId && (
                            <>
                                {" "}
                                <Link to={`/repos/${feedback.repoId}`}>Open it</Link>
                            </>
                        )}
                    </p>
                ) : (
                    <p className="import__examples">
                        <span className="muted">Try:</span>
                        {EXAMPLES.map((example) => (
                            <button
                                key={example}
                                type="button"
                                className="chip chip--button"
                                onClick={() => setValue(example)}
                            >
                                {example}
                            </button>
                        ))}
                    </p>
                )}
            </div>
        </div>
    );
}
