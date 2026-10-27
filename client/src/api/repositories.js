import { api } from "./client.js";

export {
    listRepositories,
    getRepository,
    importRepository,
    deleteRepository,
    startSync,
    getSyncStatus,
    getAnalytics,
    normalizeRepositoryUrl,
};

async function listRepositories() {
    const { data } = await api.get("/repositories");
    return data.repositories;
}

async function getRepository(id) {
    const { data } = await api.get(`/repositories/${id}`);
    return data.repository;
}

async function importRepository(url) {
    const { data } = await api.post("/repositories/import", { url });
    return data.repository;
}

async function deleteRepository(id) {
    const { data } = await api.delete(`/repositories/${id}`);
    return data.deletedRepo;
}

async function startSync(id) {
    const { data } = await api.patch(`/repositories/${id}/sync`);
    return data;
}

async function getSyncStatus(id) {
    const { data } = await api.get(`/repositories/${id}/sync-status`);
    return data;
}

async function getAnalytics(id) {
    const { data } = await api.get(`/analytics/${id}`);
    return data;
}

// Accepts "owner/repo", "github.com/owner/repo" or a full URL.
// Returns null when the input can't be a GitHub repository.
function normalizeRepositoryUrl(input) {
    const value = input.trim().replace(/\.git$/, "").replace(/\/+$/, "");

    if (/^[\w.-]+\/[\w.-]+$/.test(value)) {
        return `https://github.com/${value}`;
    }

    const withProtocol = /^https?:\/\//.test(value) ? value : `https://${value}`;

    try {
        const url = new URL(withProtocol);
        const parts = url.pathname.split("/").filter(Boolean);

        if (url.hostname.replace(/^www\./, "") !== "github.com" || parts.length < 2) {
            return null;
        }

        return `https://github.com/${parts[0]}/${parts[1]}`;
    } catch {
        return null;
    }
}
