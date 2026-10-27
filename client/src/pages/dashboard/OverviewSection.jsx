import { ArrowDown, OctagonAlert, Quote, TriangleAlert } from "lucide-react";

import HealthGauge from "../../components/charts/HealthGauge.jsx";
import RadarChart from "../../components/charts/RadarChart.jsx";
import { HealthPill } from "../../components/StatusPill.jsx";
import { timeAgo } from "../../lib/format.js";
import { DIMENSIONS, DIMENSION_ORDER, STATUS, statusOf } from "../../lib/health.js";

const CONFIDENCE = {
    high: "High confidence",
    medium: "Medium confidence",
    low: "Low confidence",
    none: "No confidence",
};

export default function OverviewSection({ analytics }) {
    const { health, bottlenecks, aiExplanation } = analytics;
    const status = statusOf(health.status);

    const axes = DIMENSION_ORDER.map((key) => ({
        key,
        label: DIMENSIONS[key].label,
        score: health.dimensions[key]?.score ?? null,
        status: health.dimensions[key]?.status,
    }));
    const measured = axes.filter((a) => a.score !== null).length;

    return (
        <section id="overview" className="overview" aria-label="Overview">
            <div className={`overview__score card wash-${status}`}>
                <span className="eyebrow">Overall health</span>
                <HealthGauge score={health.score} status={status} />
                <div className="overview__verdict">
                    <HealthPill status={status} size="lg" />
                    <p className="overview__mood">{STATUS[status].mood}</p>
                </div>
                <p className="overview__confidence muted">
                    {CONFIDENCE[health.confidence] ?? "Unknown confidence"} · {measured} of {axes.length} dimensions
                    measured
                    <br />
                    Checked {timeAgo(analytics.calculatedAt)}
                </p>
            </div>

            <div className="overview__shape card">
                <span className="eyebrow">The shape of it</span>
                <h3>Health by dimension</h3>
                <RadarChart axes={axes} />
            </div>

            <div className="overview__summary">
                <div className="card summary-card">
                    <Quote size={28} strokeWidth={2.4} className="summary-card__mark" aria-hidden="true" />
                    <span className="eyebrow">The short version</span>
                    <p className="summary-card__text">
                        {aiExplanation?.summary ?? "No AI summary came back for this repository."}
                    </p>
                    <a href="#second-opinion" className="link-arrow">
                        Read the full second opinion <ArrowDown size={15} strokeWidth={2.6} aria-hidden="true" />
                    </a>
                </div>

                <a href="#symptoms" className="symptom-tally card">
                    <span className="eyebrow">Symptoms found</span>
                    <span className="symptom-tally__total tnum">{bottlenecks.total}</span>
                    <span className="symptom-tally__split">
                        <span className="pill pill--sm tone-critical">
                            <OctagonAlert size={12} strokeWidth={2.6} aria-hidden="true" />
                            {bottlenecks.critical} critical
                        </span>
                        <span className="pill pill--sm tone-warning">
                            <TriangleAlert size={12} strokeWidth={2.6} aria-hidden="true" />
                            {bottlenecks.warning} warning
                        </span>
                    </span>
                </a>
            </div>
        </section>
    );
}
