import { useEffect, useState } from "react";

const DEFAULT_LINES = ["Taking the repo's pulse…"];

export default function PulseLoader({ lines = DEFAULT_LINES, interval = 2600, compact = false }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (lines.length < 2) return undefined;
        const timer = setInterval(() => setIndex((i) => (i + 1) % lines.length), interval);
        return () => clearInterval(timer);
    }, [lines, interval]);

    return (
        <div className={`pulse-loader ${compact ? "pulse-loader--compact" : ""}`} role="status">
            <svg className="pulse-loader__line" viewBox="0 0 240 60" aria-hidden="true">
                <path
                    d="M0 30h70l10-18 14 40 14-48 12 38 8-12h112"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="100"
                />
            </svg>
            <p key={index} className="pulse-loader__text">
                {lines[index]}
            </p>
        </div>
    );
}
