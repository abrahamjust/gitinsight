import ScoreBar from "../../components/charts/ScoreBar.jsx";
import { HealthPill } from "../../components/StatusPill.jsx";
import { DIMENSIONS, DIMENSION_ORDER, formatMetric, statusOf } from "../../lib/health.js";
import { Section } from "./Panel.jsx";

function DimensionCard({ dimensionKey, dimension }) {
    const meta = DIMENSIONS[dimensionKey];
    const Icon = meta.icon;
    const status = statusOf(dimension?.status);
    const metrics = Object.entries(dimension?.metrics ?? {});
    const applicable = dimension?.score !== null && dimension?.score !== undefined;

    return (
        <article className={`vital card ${applicable ? "" : "is-na"}`}>
            <header className="vital__head">
                <span className={`vital__icon fill-${status}`} aria-hidden="true">
                    <Icon size={20} strokeWidth={2.4} />
                </span>
                <div className="vital__names">
                    <h3>{meta.label}</h3>
                    <span className="muted">{meta.nickname}</span>
                </div>
                <span className="vital__score tnum">{applicable ? dimension.score : "—"}</span>
            </header>

            <div className="vital__status">
                <HealthPill status={status} size="sm" />
                <ScoreBar score={dimension?.score} status={status} label={`${meta.label} score`} />
            </div>

            <p className="vital__blurb muted">{meta.blurb}</p>

            {applicable ? (
                <ul className="vital__metrics">
                    {metrics.map(([key, metric]) => {
                        const { label, value } = formatMetric(key, metric.value);
                        return (
                            <li key={key} className="metric-row">
                                <span className="metric-row__label">{label}</span>
                                <span className="metric-row__value tnum">{value}</span>
                                <span className={`metric-row__score tnum tone-text-${statusOf(metric.status)}`}>
                                    <span className={`dot fill-${statusOf(metric.status)}`} aria-hidden="true" />
                                    {metric.score ?? "n/a"}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="vital__na">Not enough data to score this one, so it doesn't count against the overall score.</p>
            )}
        </article>
    );
}

export default function VitalsSection({ health }) {
    return (
        <Section id="vitals" eyebrow="Health engine" title="Vitals">
            <div className="vital-grid">
                {DIMENSION_ORDER.map((key) => (
                    <DimensionCard key={key} dimensionKey={key} dimension={health.dimensions[key]} />
                ))}
            </div>
        </Section>
    );
}
