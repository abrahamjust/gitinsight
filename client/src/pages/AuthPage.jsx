import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LoaderCircle, Lock, Mail, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { errorMessage } from "../api/client.js";
import Logo from "../components/Logo.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const COPY = {
    login: {
        title: "Welcome back.",
        subtitle: "Your repos have been waiting. Some of them nervously.",
        submit: "Log in",
        busy: "Logging in…",
        switchText: "New here?",
        switchLink: "Create an account",
        switchTo: "/signup",
    },
    signup: {
        title: "Make an account.",
        subtitle: "Takes ten seconds. Diagnosing your repos takes a little longer.",
        submit: "Create account",
        busy: "Creating your account…",
        switchText: "Already have one?",
        switchLink: "Log in",
        switchTo: "/login",
    },
};

function Field({ icon: Icon, label, children, hint }) {
    return (
        <label className="field">
            <span className="field__label">{label}</span>
            <span className="field__control">
                <Icon size={18} strokeWidth={2.2} className="field__icon" aria-hidden="true" />
                {children}
            </span>
            {hint && <span className="field__hint">{hint}</span>}
        </label>
    );
}

export default function AuthPage({ mode }) {
    const copy = COPY[mode];
    const { login, signup } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const update = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        if (mode === "signup" && form.password.length < 8) {
            setError("Use at least 8 characters for your password.");
            return;
        }

        setSubmitting(true);
        try {
            if (mode === "signup") {
                await signup(form);
            } else {
                await login(form.email, form.password);
            }
            navigate(location.state?.from || "/", { replace: true });
        } catch (err) {
            setError(err.isAxiosError ? errorMessage(err) : err.message);
            setSubmitting(false);
        }
    };

    return (
        <div className="auth">
            <aside className="auth__poster" aria-hidden="true">
                <div className="auth__poster-top">
                    <Logo size="lg" />
                </div>

                <div className="auth__headline">
                    <h1>
                        Give your repos a <span className="scribble">check-up</span>.
                    </h1>
                    <p>
                        Import any public GitHub repo. GitInsight reads its commits, PRs, issues and
                        reviews, scores its health, flags the bottlenecks, and gets a second opinion
                        from AI.
                    </p>
                </div>

                <div className="auth__stickers">
                    <div className="mini-card sticker tilt-l">
                        <span className="mini-card__eyebrow">overall health</span>
                        <span className="mini-card__score">82</span>
                        <span className="pill pill--sm tone-good">Good</span>
                    </div>
                    <div className="sticker sticker--note accent-pink tilt-r">
                        bus factor: <b>1</b>
                        <small>…that's a lot of trust in one person</small>
                    </div>
                    <div className="sticker sticker--note accent-lime tilt-l2">
                        median merge <b>9h</b>
                    </div>
                    <div className="sticker sticker--note accent-sky tilt-r2">
                        3 symptoms found
                    </div>
                </div>
            </aside>

            <section className="auth__panel">
                <div className="auth__panel-top">
                    <span className="auth__mobile-logo">
                        <Logo />
                    </span>
                    <ThemeToggle />
                </div>

                <form className="auth__form card" onSubmit={handleSubmit} noValidate>
                    <h2>{copy.title}</h2>
                    <p className="muted auth__subtitle">{copy.subtitle}</p>

                    {error && (
                        <div className="banner banner--error" role="alert">
                            {error}
                        </div>
                    )}

                    {mode === "signup" && (
                        <Field icon={User} label="Username">
                            <input
                                type="text"
                                required
                                autoComplete="username"
                                value={form.username}
                                onChange={update("username")}
                                placeholder="octocat"
                            />
                        </Field>
                    )}

                    <Field icon={Mail} label="Email">
                        <input
                            type="email"
                            required
                            autoComplete="email"
                            value={form.email}
                            onChange={update("email")}
                            placeholder="you@example.com"
                        />
                    </Field>

                    <Field
                        icon={Lock}
                        label="Password"
                        hint={mode === "signup" ? "At least 8 characters." : undefined}
                    >
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            autoComplete={mode === "signup" ? "new-password" : "current-password"}
                            value={form.password}
                            onChange={update("password")}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            className="field__peek"
                            onClick={() => setShowPassword((s) => !s)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </Field>

                    <button
                        type="submit"
                        className="btn btn--primary btn--block btn--lg"
                        disabled={submitting || !form.email || !form.password || (mode === "signup" && !form.username)}
                    >
                        {submitting ? (
                            <>
                                <LoaderCircle size={18} className="spin" aria-hidden="true" /> {copy.busy}
                            </>
                        ) : (
                            <>
                                {copy.submit} <ArrowRight size={18} strokeWidth={2.6} aria-hidden="true" />
                            </>
                        )}
                    </button>

                    <p className="auth__switch">
                        {copy.switchText} <Link to={copy.switchTo}>{copy.switchLink}</Link>
                    </p>
                </form>
            </section>
        </div>
    );
}
