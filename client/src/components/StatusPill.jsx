import {
    CircleCheck,
    CircleHelp,
    Hourglass,
    LoaderCircle,
    OctagonAlert,
    Sparkles,
    ThumbsUp,
    TriangleAlert,
} from "lucide-react";

import { STATUS, statusOf } from "../lib/health.js";

const HEALTH_ICONS = {
    excellent: Sparkles,
    good: ThumbsUp,
    warning: TriangleAlert,
    critical: OctagonAlert,
    not_applicable: CircleHelp,
};

// Status colors always travel with an icon and a label, never alone
export function HealthPill({ status, size = "md", label }) {
    const key = statusOf(status);
    const Icon = HEALTH_ICONS[key];

    return (
        <span className={`pill pill--${size} tone-${key}`}>
            <Icon size={size === "sm" ? 12 : 14} strokeWidth={2.6} aria-hidden="true" />
            {label ?? STATUS[key].label}
        </span>
    );
}

const SYNC = {
    pending: { label: "Queued", icon: Hourglass, tone: "sync-pending" },
    processing: { label: "Syncing", icon: LoaderCircle, tone: "sync-processing", spin: true },
    completed: { label: "Synced", icon: CircleCheck, tone: "sync-completed" },
    failed: { label: "Sync failed", icon: OctagonAlert, tone: "sync-failed" },
};

export function SyncPill({ status, size = "md" }) {
    const meta = SYNC[status] ?? SYNC.pending;
    const Icon = meta.icon;

    return (
        <span className={`pill pill--${size} tone-${meta.tone}`}>
            <Icon
                size={size === "sm" ? 12 : 14}
                strokeWidth={2.6}
                className={meta.spin ? "spin" : undefined}
                aria-hidden="true"
            />
            {meta.label}
        </span>
    );
}
