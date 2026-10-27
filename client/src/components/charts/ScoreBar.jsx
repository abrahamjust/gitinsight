import { statusOf } from "../../lib/health.js";

export default function ScoreBar({ score, status, label }) {
    const key = statusOf(status);
    const hasScore = score !== null && score !== undefined;

    return (
        <div
            className="scorebar"
            role="meter"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={hasScore ? score : undefined}
            aria-valuetext={hasScore ? `${score} out of 100` : "No score"}
        >
            <span
                className={`scorebar__fill fill-${key}`}
                style={{ width: `${hasScore ? Math.max(score, 3) : 0}%` }}
            />
        </div>
    );
}
