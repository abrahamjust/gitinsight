import { Link } from "react-router-dom";

export default function Logo({ to = "/", size = "md" }) {
    return (
        <Link to={to} className={`logo logo--${size}`} aria-label="GitInsight home">
            <span className="logo__mark" aria-hidden="true">
                <svg viewBox="0 0 32 24" width="100%" height="100%">
                    <path
                        className="logo__pulse"
                        d="M2 12h6l3-7 5 14 3-7h11"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
            <span className="logo__word">
                git<em>insight</em>
            </span>
        </Link>
    );
}
