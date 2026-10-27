import { ArrowDownRight, ArrowRight, ArrowUpRight, Sprout } from "lucide-react";

import { formatNumber, formatSignedPercent } from "../../lib/format.js";

const TREND_ICON = {
    up: ArrowUpRight,
    down: ArrowDownRight,
    stable: ArrowRight,
    started: Sprout,
};

/**
 * Previous 30 days vs last 30 days for one count, on its own scale.
 * Rendered as small multiples so commits don't flatten PRs and issues.
 */
export default function Momentum({ title, previous, current, trend, goodDirection = "up" }) {
    const max = Math.max(previous, current, 1);
    const direction = trend?.direction ?? "stable";
    const Icon = TREND_ICON[direction] ?? ArrowRight;

    let tone = "neutral";
    if (direction === "up" || direction === "started") tone = goodDirection === "up" ? "good" : "bad";
    if (direction === "down") tone = goodDirection === "up" ? "bad" : "good";

    return (
        <div className="momentum">
            <div className="momentum__head">
                <span className="momentum__title">{title}</span>
                <span className={`momentum__trend trend-${tone}`}>
                    <Icon size={14} strokeWidth={2.8} aria-hidden="true" />
                    {direction === "started" ? "new" : formatSignedPercent(trend?.changePercent)}
                </span>
            </div>
            <div className="momentum__bars">
                <div className="momentum__row">
                    <span className="momentum__label">Prev 30d</span>
                    <span className="momentum__track">
                        <span
                            className="momentum__bar momentum__bar--prev"
                            style={{ width: `${(previous / max) * 100}%` }}
                        />
                    </span>
                    <span className="momentum__value tnum">{formatNumber(previous)}</span>
                </div>
                <div className="momentum__row">
                    <span className="momentum__label">Last 30d</span>
                    <span className="momentum__track">
                        <span
                            className="momentum__bar momentum__bar--now"
                            style={{ width: `${(current / max) * 100}%` }}
                        />
                    </span>
                    <span className="momentum__value tnum">{formatNumber(current)}</span>
                </div>
            </div>
        </div>
    );
}
