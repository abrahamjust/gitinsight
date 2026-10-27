export function Section({ id, eyebrow, title, aside, children }) {
    return (
        <section id={id} className="dash-section" aria-labelledby={`${id}-title`}>
            <header className="dash-section__head">
                <div>
                    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
                    <h2 id={`${id}-title`}>{title}</h2>
                </div>
                {aside}
            </header>
            {children}
        </section>
    );
}

export function Stat({ label, value, hint, emphasis = false }) {
    return (
        <div className={`stat ${emphasis ? "stat--big" : ""}`}>
            <dt className="stat__label">{label}</dt>
            <dd className="stat__value tnum">{value}</dd>
            {hint && <dd className="stat__hint">{hint}</dd>}
        </div>
    );
}

export function StatGrid({ children }) {
    return <dl className="stat-grid">{children}</dl>;
}
