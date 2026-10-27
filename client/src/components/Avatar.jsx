import { useState } from "react";

import { initials } from "../lib/format.js";

const ACCENTS = ["sun", "lime", "pink", "sky", "peach", "lilac"];

export function accentFor(text = "") {
    let hash = 0;
    for (const char of text) {
        hash = (hash * 31 + char.charCodeAt(0)) | 0;
    }
    return ACCENTS[Math.abs(hash) % ACCENTS.length];
}

export default function Avatar({ src, name, size = 40, square = false }) {
    const [broken, setBroken] = useState(false);
    const style = { width: size, height: size, fontSize: size * 0.38 };
    const className = `avatar ${square ? "avatar--square" : ""}`;

    if (src && !broken) {
        return (
            <img
                className={className}
                src={src}
                alt=""
                style={style}
                loading="lazy"
                onError={() => setBroken(true)}
            />
        );
    }

    return (
        <span className={`${className} accent-${accentFor(name)}`} style={style} aria-hidden="true">
            {initials(name)}
        </span>
    );
}
