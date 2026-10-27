import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "gi-theme";
const ThemeContext = createContext(null);

function readStoredTheme() {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

function systemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
    // index.html already stamped data-theme before first paint
    const [theme, setTheme] = useState(
        () => document.documentElement.dataset.theme || readStoredTheme() || systemTheme()
    );

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    // follow the OS until the user picks a theme themselves
    useEffect(() => {
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const follow = () => {
            if (!readStoredTheme()) {
                setTheme(systemTheme());
            }
        };
        media.addEventListener("change", follow);
        return () => media.removeEventListener("change", follow);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme((current) => {
            const next = current === "dark" ? "light" : "dark";
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch {
                // storage unavailable: the toggle still works for this visit
            }
            return next;
        });
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
