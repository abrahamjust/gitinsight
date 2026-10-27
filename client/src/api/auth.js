import { api } from "./client.js";

export { getMe, login, signup, logout };

// /auth/me returns the whole user document, so only keep what the UI needs
function toSessionUser(user) {
    if (!user) {
        return null;
    }

    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
    };
}

async function getMe() {
    const { data } = await api.get("/auth/me");
    return data.authenticated ? toSessionUser(data.user) : null;
}

async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    return toSessionUser(data.user);
}

// the backend signs the new user in straight away
async function signup({ username, email, password }) {
    const { data } = await api.post("/auth/signup", {
        username,
        email,
        password,
    });
    return toSessionUser(data.user);
}

async function logout() {
    await api.post("/auth/logout");
}
