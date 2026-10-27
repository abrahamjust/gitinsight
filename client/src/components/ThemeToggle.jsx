import { Moon, Sun } from "lucide-react";

import { useTheme } from "../context/ThemeContext.jsx";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const dark = theme === "dark";

    return (
        <button
            type="button"
            className={`theme-toggle ${dark ? "is-dark" : ""}`}
            onClick={toggleTheme}
            role="switch"
            aria-checked={dark}
            aria-label="Dark mode"
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
            <span className="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true">
                <Sun size={14} strokeWidth={2.5} />
            </span>
            <span className="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true">
                <Moon size={14} strokeWidth={2.5} />
            </span>
            <span className="theme-toggle__knob" aria-hidden="true" />
        </button>
    );
}
