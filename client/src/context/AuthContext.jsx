import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import * as authApi from "../api/auth.js";
import { onUnauthorized } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        onUnauthorized(() => setUser(null));

        authApi
            .getMe()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setReady(true));
    }, []);

    const login = useCallback(async (email, password) => {
        const sessionUser = await authApi.login(email, password);
        setUser(sessionUser);
        return sessionUser;
    }, []);

    const signup = useCallback(async ({ username, email, password }) => {
        const sessionUser = await authApi.signup({ username, email, password });
        setUser(sessionUser);
        return sessionUser;
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            setUser(null);
        }
    }, []);

    const value = useMemo(
        () => ({ user, ready, login, signup, logout }),
        [user, ready, login, signup, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside <AuthProvider>");
    }
    return context;
}
