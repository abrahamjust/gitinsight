import axios from "axios";

export const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

let unauthorizedHandler = null;

// AuthContext registers itself here so any 401 drops the user back to login
export function onUnauthorized(handler) {
    unauthorizedHandler = handler;
}

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // a wrong password is also a 401, but that's not a lost session
        const isLoginAttempt = error.config?.url === "/auth/login";
        if (error.response?.status === 401 && !isLoginAttempt && unauthorizedHandler) {
            unauthorizedHandler();
        }
        return Promise.reject(error);
    }
);

export function errorMessage(error, fallback = "Something went wrong.") {
    if (!error) {
        return fallback;
    }

    if (!error.response) {
        return "Can't reach the GitInsight server. Is the backend running?";
    }

    return error.response.data?.message || fallback;
}
