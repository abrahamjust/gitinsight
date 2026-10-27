import axios from "axios";
import { env } from "../../config/env.js";

export {
    restGet,
    restPaginate,
    graphql,
    GitHubError,
    GitHubRateLimitError,
    GitHubNotFoundError,
};

// GitHub flags clients that fire many requests at once ("secondary rate
// limits"), so every request goes through this small semaphore.
const MAX_CONCURRENT_REQUESTS = 6;
const MAX_RETRIES = 4;
// Primary-limit resets further away than this fail the job instead of
// keeping a worker asleep.
const MAX_RATE_LIMIT_WAIT_MS = 90 * 1000;

class GitHubError extends Error {
    constructor(message, { status = null, retryable = false } = {}) {
        super(message);
        this.name = "GitHubError";
        this.status = status;
        this.retryable = retryable;
    }
}

class GitHubRateLimitError extends GitHubError {
    constructor(resetAt) {
        const time = resetAt ? resetAt.toLocaleTimeString() : "later";
        super(`GitHub API rate limit reached. It resets at ${time}.`, { status: 429 });
        this.name = "GitHubRateLimitError";
        this.resetAt = resetAt;
    }
}

class GitHubNotFoundError extends GitHubError {
    constructor(message = "Repository not found on GitHub. It may be private or misspelled.") {
        super(message, { status: 404 });
        this.name = "GitHubNotFoundError";
    }
}

const http = axios.create({
    baseURL: "https://api.github.com",
    timeout: 60 * 1000,
    headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "GitInsight",
    },
});

let active = 0;
const waiting = [];

async function withSlot(task) {
    if (active >= MAX_CONCURRENT_REQUESTS) {
        await new Promise((resolve) => waiting.push(resolve));
    }
    active++;
    try {
        return await task();
    } finally {
        active--;
        waiting.shift()?.();
    }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const backoff = (attempt) => Math.min(30000, 1000 * 2 ** attempt) + Math.random() * 500;

// Decides what to do with a failed response: retry after `waitMs`, or throw.
function classify(error, attempt) {
    const response = error.response;

    if (!response) {
        // network error or timeout
        return { waitMs: backoff(attempt) };
    }

    const { status, headers, data } = response;
    const message = typeof data?.message === "string" ? data.message : "";

    if (status === 401) {
        throw new GitHubError("GitHub rejected the token. Check GITHUB_TOKEN.", { status });
    }

    if (status === 404) {
        throw new GitHubNotFoundError();
    }

    if (status === 403 || status === 429) {
        if (headers["retry-after"]) {
            return { waitMs: Number(headers["retry-after"]) * 1000 + 250 };
        }

        if (headers["x-ratelimit-remaining"] === "0") {
            const resetAt = new Date(Number(headers["x-ratelimit-reset"]) * 1000);
            const waitMs = resetAt - Date.now() + 1000;
            if (waitMs > MAX_RATE_LIMIT_WAIT_MS) {
                throw new GitHubRateLimitError(resetAt);
            }
            return { waitMs: Math.max(waitMs, 1000) };
        }

        if (/secondary rate limit|abuse/i.test(message)) {
            // GitHub asks for at least a minute when no retry-after is given
            return { waitMs: 60 * 1000 };
        }

        throw new GitHubError(message || "GitHub refused the request.", { status });
    }

    if (status >= 500) {
        return { waitMs: backoff(attempt) };
    }

    throw new GitHubError(message || `GitHub request failed (${status}).`, { status });
}

async function request(config) {
    for (let attempt = 0; ; attempt++) {
        try {
            return await withSlot(() => http.request(config));
        } catch (error) {
            if (error instanceof GitHubError) throw error;

            const { waitMs } = classify(error, attempt);
            if (attempt >= MAX_RETRIES) {
                throw new GitHubError(
                    `GitHub request kept failing: ${error.message}`,
                    { status: error.response?.status ?? null, retryable: true }
                );
            }
            await sleep(waitMs);
        }
    }
}

async function restGet(path, params = {}) {
    return request({ method: "GET", url: path, params });
}

function lastPageFrom(linkHeader) {
    const match = linkHeader?.match(/[?&]page=(\d+)[^>]*>;\s*rel="last"/);
    return match ? Number(match[1]) : 1;
}

/**
 * Fetches every page of a REST list endpoint. Page 1 reveals the last page
 * via the Link header, so the rest are fetched in parallel (bounded by the
 * shared semaphore) instead of one by one.
 */
async function restPaginate(path, params = {}, { maxItems = Infinity, onProgress } = {}) {
    const perPage = 100;
    const first = await restGet(path, { ...params, per_page: perPage, page: 1 });
    const firstItems = Array.isArray(first.data) ? first.data : [];

    const lastPage = Math.min(
        lastPageFrom(first.headers.link),
        Math.ceil(maxItems / perPage)
    );

    let fetched = firstItems.length;
    onProgress?.(fetched);

    const rest = await Promise.all(
        Array.from({ length: Math.max(0, lastPage - 1) }, (_, i) =>
            restGet(path, { ...params, per_page: perPage, page: i + 2 }).then((response) => {
                const items = Array.isArray(response.data) ? response.data : [];
                fetched += items.length;
                onProgress?.(fetched);
                return items;
            })
        )
    );

    return [firstItems, ...rest].flat().slice(0, maxItems);
}

async function graphql(query, variables = {}) {
    for (let attempt = 0; ; attempt++) {
        const response = await request({
            method: "POST",
            url: "/graphql",
            data: { query, variables },
        });

        const errors = response.data.errors;
        if (!errors?.length) {
            return response.data.data;
        }

        if (errors.some((e) => e.type === "NOT_FOUND")) {
            throw new GitHubNotFoundError();
        }

        if (errors.some((e) => e.type === "RATE_LIMITED")) {
            const reset = response.headers["x-ratelimit-reset"];
            const resetAt = reset ? new Date(Number(reset) * 1000) : null;
            const waitMs = resetAt ? resetAt - Date.now() + 1000 : Infinity;
            if (waitMs > MAX_RATE_LIMIT_WAIT_MS || attempt >= MAX_RETRIES) {
                throw new GitHubRateLimitError(resetAt);
            }
            await sleep(Math.max(waitMs, 1000));
            continue;
        }

        throw new GitHubError(`GitHub GraphQL error: ${errors[0].message}`);
    }
}
