import { useState } from "react";

import { STATUS, statusOf } from "../../lib/health.js";

const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = 96;
const RINGS = [25, 50, 75, 100];
// extra room left/right so side labels like "Collaboration" stay inside the card
const PAD_X = 64;
const VIEWBOX = `${-PAD_X} 0 ${SIZE + PAD_X * 2} ${SIZE}`;

function polar(index, count, value) {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const r = (RADIUS * value) / 100;
    return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
}

/**
 * axes: [{ key, label, score (0-100 | null), status }]
 * Dimensions without data sit at the center with a hollow marker.
 */
export default function RadarChart({ axes }) {
    const [active, setActive] = useState(null);
    const count = axes.length;

    const points = axes.map((axis, i) => polar(i, count, axis.score ?? 0));
    const polygon = points.map((p) => p.join(",")).join(" ");
    const hovered = active !== null ? axes[active] : null;

    return (
        <div className="radar">
            <svg
                viewBox={VIEWBOX}
                className="radar__svg"
                role="img"
                aria-label={`Health by dimension: ${axes
                    .map((a) => `${a.label} ${a.score ?? "no data"}`)
                    .join(", ")}`}
            >
                {RINGS.map((ring) => (
                    <polygon
                        key={ring}
                        className="radar__ring"
                        points={axes.map((_, i) => polar(i, count, ring).join(",")).join(" ")}
                    />
                ))}
                {axes.map((axis, i) => {
                    const [x, y] = polar(i, count, 100);
                    return <line key={axis.key} x1={CENTER} y1={CENTER} x2={x} y2={y} className="radar__spoke" />;
                })}

                <polygon points={polygon} className="radar__area" />

                {axes.map((axis, i) => {
                    const [lx, ly] = polar(i, count, 128);
                    const anchor = Math.abs(lx - CENTER) < 4 ? "middle" : lx > CENTER ? "start" : "end";
                    return (
                        <text
                            key={axis.key}
                            x={lx}
                            y={ly}
                            textAnchor={anchor}
                            dominantBaseline="middle"
                            className={`radar__label ${active === i ? "is-active" : ""}`}
                        >
                            <tspan>{axis.label}</tspan>
                            <tspan x={lx} dy="1.2em" className="radar__label-score">
                                {axis.score ?? "n/a"}
                            </tspan>
                        </text>
                    );
                })}

                {axes.map((axis, i) => {
                    const [x, y] = points[i];
                    const empty = axis.score === null || axis.score === undefined;
                    return (
                        <g
                            key={axis.key}
                            tabIndex={0}
                            className="radar__node"
                            onMouseEnter={() => setActive(i)}
                            onMouseLeave={() => setActive(null)}
                            onFocus={() => setActive(i)}
                            onBlur={() => setActive(null)}
                        >
                            <circle cx={x} cy={y} r="16" className="radar__hit" />
                            <circle
                                cx={x}
                                cy={y}
                                r={active === i ? 6.5 : 5}
                                className={`radar__dot ${empty ? "is-empty" : ""}`}
                            />
                        </g>
                    );
                })}
            </svg>

            {hovered && (
                <div
                    className="chart-tip radar__tip"
                    style={{
                        left: `${((points[active][0] + PAD_X) / (SIZE + PAD_X * 2)) * 100}%`,
                        top: `${(points[active][1] / SIZE) * 100}%`,
                    }}
                >
                    <strong>{hovered.label}</strong>
                    <span className="tnum">
                        {hovered.score ?? "—"} · {STATUS[statusOf(hovered.status)].label}
                    </span>
                </div>
            )}
        </div>
    );
}
