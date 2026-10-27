import { PartyPopper } from "lucide-react";

import { HealthPill } from "../../components/StatusPill.jsx";
import { DIMENSIONS, formatEvidence } from "../../lib/health.js";
import { Section } from "./Panel.jsx";

const SEVERITY_RANK = { critical: 0, warning: 1 };

export default function SymptomsSection({ bottlenecks }) {
    const items = [...(bottlenecks.bottlenecks ?? [])].sort(
        (a, b) => (SEVERITY_RANK[a.severity] ?? 2) - (SEVERITY_RANK[b.severity] ?? 2)
    );

    return (
        <Section id="symptoms" eyebrow="Bottleneck detection" title="Symptoms">
            {items.length === 0 ? (
                <div className="card clean-bill">
                    <PartyPopper size={32} strokeWidth={2.2} aria-hidden="true" />
                    <div>
                        <h3>Clean bill of health.</h3>
                        <p className="muted">No bottlenecks detected in the data we have. Go treat yourself.</p>
                    </div>
                </div>
            ) : (
                <div className="symptom-grid">
                    {items.map((item) => {
                        const dimension = DIMENSIONS[item.category];
                        const Icon = dimension?.icon;
                        return (
                            <article key={item.type} className={`symptom card edge-${item.severity}`}>
                                <header className="symptom__head">
                                    <HealthPill status={item.severity} size="sm" />
                                    {dimension && (
                                        <span className="chip chip--icon">
                                            <Icon size={13} strokeWidth={2.4} aria-hidden="true" />
                                            {dimension.label}
                                        </span>
                                    )}
                                </header>
                                <h3>{item.title}</h3>
                                <p className="muted">{item.description}</p>
                                <dl className="evidence">
                                    {formatEvidence(item.evidence).map((row) => (
                                        <div key={row.key} className="evidence__row">
                                            <dt>{row.label}</dt>
                                            <dd className="tnum">{row.value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </article>
                        );
                    })}
                </div>
            )}
        </Section>
    );
}
