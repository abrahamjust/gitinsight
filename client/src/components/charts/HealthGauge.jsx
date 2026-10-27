import { STATUS, statusOf } from "../../lib/health.js";

const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = 86;
const START = 150; // degrees, clockwise from 3 o'clock
const SWEEP = 240;

function point(angle, radius = RADIUS) {
    const radians = (angle * Math.PI) / 180;
    return [CENTER + radius * Math.cos(radians), CENTER + radius * Math.sin(radians)];
}

const [sx, sy] = point(START);
const [ex, ey] = point(START + SWEEP);
const ARC = `M ${sx} ${sy} A ${RADIUS} ${RADIUS} 0 1 1 ${ex} ${ey}`;

// band edges from server/src/services/health/status.js
const THRESHOLDS = [50, 75, 90];

export default function HealthGauge({ score, status }) {
    const key = statusOf(status);
    const hasScore = score !== null && score !== undefined;
    const value = hasScore ? Math.max(0, Math.min(100, score)) : 0;

    return (
        <figure className="gauge" aria-label={hasScore ? `Health score ${score} out of 100, ${STATUS[key].label}` : "No health score"}>
            <svg viewBox={`0 0 ${SIZE} ${SIZE * 0.86}`} className="gauge__svg" role="img" aria-hidden="true">
                <path d={ARC} className="gauge__track" pathLength="100" />
                {hasScore && (
                    <path
                        d={ARC}
                        className={`gauge__value stroke-${key}`}
                        pathLength="100"
                        style={{ "--gauge-value": value }}
                    />
                )}
                {THRESHOLDS.map((t) => {
                    const angle = START + (SWEEP * t) / 100;
                    const [x1, y1] = point(angle, RADIUS - 16);
                    const [x2, y2] = point(angle, RADIUS + 16);
                    const [lx, ly] = point(angle, RADIUS + 28);
                    return (
                        <g key={t}>
                            <line x1={x1} y1={y1} x2={x2} y2={y2} className="gauge__tick" />
                            <text x={lx} y={ly} className="gauge__tick-label" textAnchor="middle" dominantBaseline="middle">
                                {t}
                            </text>
                        </g>
                    );
                })}
            </svg>
            <figcaption className="gauge__center">
                <span className="gauge__score tnum">{hasScore ? score : "—"}</span>
                <span className="gauge__out-of">/ 100</span>
            </figcaption>
        </figure>
    );
}
