export {
    formatNumber,
    formatCompact,
    formatPercent,
    formatSignedPercent,
    formatHours,
    formatDays,
    formatDate,
    timeAgo,
    initials,
};

const isMissing = (value) => value === null || value === undefined || Number.isNaN(value);

function formatNumber(value, digits = 0) {
    if (isMissing(value)) return "—";
    return Number(value).toLocaleString(undefined, {
        maximumFractionDigits: digits,
    });
}

function formatCompact(value) {
    if (isMissing(value)) return "—";
    return new Intl.NumberFormat(undefined, {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);
}

function formatPercent(value, digits = 0) {
    if (isMissing(value)) return "—";
    return `${Number(value).toFixed(digits)}%`;
}

function formatSignedPercent(value) {
    if (isMissing(value)) return "new";
    const rounded = Math.round(value);
    return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

function formatHours(hours) {
    if (isMissing(hours)) return "—";
    if (hours === 0) return "0h";
    if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
    if (hours < 48) return `${hours.toFixed(hours < 10 ? 1 : 0)}h`;
    return formatDays(hours / 24);
}

function formatDays(days) {
    if (isMissing(days)) return "—";
    if (days < 1) return formatHours(days * 24);
    if (days < 60) return `${Math.round(days)}d`;
    if (days < 730) return `${(days / 30.44).toFixed(1).replace(/\.0$/, "")}mo`;
    return `${(days / 365.25).toFixed(1).replace(/\.0$/, "")}y`;
}

function formatDate(value) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

const UNITS = [
    ["year", 365 * 24 * 3600],
    ["month", 30 * 24 * 3600],
    ["week", 7 * 24 * 3600],
    ["day", 24 * 3600],
    ["hour", 3600],
    ["minute", 60],
];

function timeAgo(value) {
    if (!value) return "never";

    const seconds = (new Date(value) - Date.now()) / 1000;
    const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

    for (const [unit, size] of UNITS) {
        if (Math.abs(seconds) >= size) {
            return formatter.format(Math.round(seconds / size), unit);
        }
    }

    return "just now";
}

function initials(name = "") {
    return name
        .split(/[\s._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("") || "?";
}
