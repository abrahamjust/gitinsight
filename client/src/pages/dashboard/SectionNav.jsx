import { useEffect, useRef, useState } from "react";

// a section counts as current once its top passes just under the sticky bars
const ACTIVATION_OFFSET = 170;

export default function SectionNav({ sections }) {
    const [active, setActive] = useState(sections[0]?.id);
    const listRef = useRef(null);

    useEffect(() => {
        let frame = null;

        const update = () => {
            frame = null;
            let current = sections[0]?.id;
            for (const { id } of sections) {
                const element = document.getElementById(id);
                if (element && element.getBoundingClientRect().top <= ACTIVATION_OFFSET) {
                    current = id;
                }
            }
            // at the very bottom, the last short sections can never reach the offset
            if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
                current = sections[sections.length - 1]?.id;
            }
            setActive(current);
        };

        const onScroll = () => {
            if (frame === null) frame = requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            if (frame !== null) cancelAnimationFrame(frame);
        };
    }, [sections]);

    // keep the active tab visible when the nav scrolls horizontally on phones
    useEffect(() => {
        const nav = listRef.current?.parentElement;
        const link = listRef.current?.querySelector(".is-active");
        if (!nav || !link) return;
        if (link.offsetLeft < nav.scrollLeft || link.offsetLeft + link.offsetWidth > nav.scrollLeft + nav.clientWidth) {
            nav.scrollTo({ left: link.offsetLeft - 16, behavior: "smooth" });
        }
    }, [active]);

    return (
        <div className="section-nav-wrap">
            <nav className="section-nav" aria-label="Dashboard sections">
                <ul ref={listRef}>
                    {sections.map(({ id, label, count }) => (
                        <li key={id}>
                            <a
                                href={`#${id}`}
                                className={active === id ? "is-active" : ""}
                                aria-current={active === id ? "location" : undefined}
                            >
                                {label}
                                {count > 0 && <span className="section-nav__count tnum">{count}</span>}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}
