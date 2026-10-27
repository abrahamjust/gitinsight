import { useState } from "react";

import { formatNumber, formatPercent } from "../../lib/format.js";

/**
 * Part-to-whole bar with a direct-labelled legend.
 * segments: [{ key, label, value, color }] where color is a CSS color/var.
 */
export default function StackedBar({ segments, label, emptyText = "Nothing to show yet." }) {
    const [active, setActive] = useState(null);
    const total = segments.reduce((sum, s) => sum + (s.value || 0), 0);

    if (total === 0) {
        return <p className="chart-empty">{emptyText}</p>;
    }

    const visible = segments.filter((s) => s.value > 0);
    const hovered = segments.find((s) => s.key === active);

    let offset = 0;
    const positions = {};
    for (const s of visible) {
        const share = (s.value / total) * 100;
        positions[s.key] = offset + share / 2;
        offset += share;
    }

    return (
        <div className="stacked">
            <div className="stacked__bar" role="img" aria-label={label}>
                {visible.map((s) => (
                    <span
                        key={s.key}
                        tabIndex={0}
                        className={`stacked__seg ${active && active !== s.key ? "is-dim" : ""}`}
                        style={{ flexGrow: s.value, background: s.color }}
                        onMouseEnter={() => setActive(s.key)}
                        onMouseLeave={() => setActive(null)}
                        onFocus={() => setActive(s.key)}
                        onBlur={() => setActive(null)}
                        aria-label={`${s.label}: ${s.value}`}
                    />
                ))}
                {hovered && (
                    <div className="chart-tip stacked__tip" style={{ left: `${positions[hovered.key]}%` }}>
                        <strong>{hovered.label}</strong>
                        <span className="tnum">
                            {formatNumber(hovered.value)} · {formatPercent((hovered.value / total) * 100)}
                        </span>
                    </div>
                )}
            </div>

            <ul className="legend">
                {segments.map((s) => (
                    <li
                        key={s.key}
                        className={`legend__item ${active === s.key ? "is-active" : ""}`}
                        onMouseEnter={() => setActive(s.key)}
                        onMouseLeave={() => setActive(null)}
                    >
                        <span className="legend__swatch" style={{ background: s.color }} aria-hidden="true" />
                        <span className="legend__label">{s.label}</span>
                        <span className="legend__value tnum">
                            {formatNumber(s.value)}
                            <span className="muted"> · {formatPercent((s.value / total) * 100)}</span>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
