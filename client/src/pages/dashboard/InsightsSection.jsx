import { useState } from "react";
import { ChevronDown, Lightbulb, Sparkles } from "lucide-react";

import { HealthPill } from "../../components/StatusPill.jsx";
import { Section } from "./Panel.jsx";

// Gemini's severity vocabulary: critical | warning | positive
const SEVERITY_TONE = { critical: "critical", warning: "warning", positive: "excellent" };
const SEVERITY_RANK = { critical: 0, warning: 1, positive: 2 };

function Finding({ finding, defaultOpen }) {
    const [open, setOpen] = useState(defaultOpen);
    const tone = SEVERITY_TONE[finding.severity] ?? "not_applicable";

    return (
        <article className={`finding card edge-${tone} ${open ? "is-open" : ""}`}>
            <button
                type="button"
                className="finding__toggle"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
            >
                <HealthPill
                    status={tone}
                    size="sm"
                    label={finding.severity === "positive" ? "Positive" : undefined}
                />
                <h3>{finding.title}</h3>
                <ChevronDown size={20} strokeWidth={2.6} className="finding__chevron" aria-hidden="true" />
            </button>

            {open && (
                <div className="finding__body">
                    <p>{finding.explanation}</p>

                    {finding.evidence?.length > 0 && (
                        <div className="finding__block">
                            <span className="finding__label">Evidence</span>
                            <ul className="finding__evidence">
                                {finding.evidence.map((line) => (
                                    <li key={line}>{line}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {finding.impact && (
                        <div className="finding__block">
                            <span className="finding__label">Why it matters</span>
                            <p>{finding.impact}</p>
                        </div>
                    )}

                    {finding.recommendation && (
                        <div className="finding__rx">
                            <Lightbulb size={18} strokeWidth={2.4} aria-hidden="true" />
                            <p>{finding.recommendation}</p>
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}

export default function InsightsSection({ explanation, error }) {
    if (!explanation) {
        return (
            <Section id="second-opinion" eyebrow="AI-assisted insights" title="Second opinion">
                <div className="card empty">
                    <span className="empty__badge sticker accent-lilac tilt-l">doctor's out</span>
                    <p className="muted">
                        {error ?? "No AI explanation is available for this repository yet."} Everything
                        else on this page is computed without AI and is up to date. Reload in a minute
                        to try again.
                    </p>
                </div>
            </Section>
        );
    }

    const findings = [...(explanation.keyFindings ?? [])].sort(
        (a, b) => (SEVERITY_RANK[a.severity] ?? 3) - (SEVERITY_RANK[b.severity] ?? 3)
    );

    return (
        <Section
            id="second-opinion"
            eyebrow="AI-assisted insights"
            title="Second opinion"
            aside={
                <span className="chip chip--icon">
                    <Sparkles size={13} strokeWidth={2.4} aria-hidden="true" />
                    Grounded in the numbers below
                </span>
            }
        >
            <div className="insights">
                <div className="insights__findings">
                    {findings.map((finding, index) => (
                        <Finding key={finding.title} finding={finding} defaultOpen={index < 2} />
                    ))}
                </div>

                <aside className="insights__side">
                    {explanation.overallAssessment && (
                        <div className="card assessment">
                            <span className="eyebrow">Overall assessment</span>
                            <p>{explanation.overallAssessment}</p>
                        </div>
                    )}

                    {explanation.recommendations?.length > 0 && (
                        <div className="card rx-pad">
                            <div className="rx-pad__head">
                                <span className="rx-pad__symbol" aria-hidden="true">
                                    Rx
                                </span>
                                <div>
                                    <span className="eyebrow">Prescription</span>
                                    <h3>What to do next</h3>
                                </div>
                            </div>
                            <ol className="rx-pad__list">
                                {explanation.recommendations.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ol>
                        </div>
                    )}
                </aside>
            </div>
        </Section>
    );
}
