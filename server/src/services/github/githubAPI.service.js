import { env } from "../../config/env.js";
import {
    GitHubError,
    graphql,
    restGet,
    restPaginate,
} from "./githubClient.js";

export {
    parseRepositoryUrl,
    getRepository,
    getCommits,
    getPullRequests,
    getIssues,
    getContributors,
    getReleases,
};

// Caps each resource on a sync so huge repositories (tens of thousands of
// PRs/issues) can't exhaust the hourly rate limit. Items are fetched newest
// first, so the cap keeps the most recent history. 0 = no cap.
const MAX_ITEMS = env.GITHUB_MAX_ITEMS_PER_RESOURCE > 0
    ? env.GITHUB_MAX_ITEMS_PER_RESOURCE
    : Infinity;

function parseRepositoryUrl(repositoryUrl) {
    let url;
    try {
        url = new URL(repositoryUrl);
    } catch {
        throw new GitHubError("Invalid GitHub repository URL", { status: 400 });
    }

    const pathParts = url.pathname.split("/").filter(Boolean);

    if (url.hostname.replace(/^www\./, "") !== "github.com" || pathParts.length < 2) {
        throw new GitHubError("Invalid GitHub repository URL", { status: 400 });
    }

    return {
        owner: pathParts[0],
        repo: pathParts[1].replace(/\.git$/, ""),
    };
}

async function getRepository(repositoryUrl) {
    const { owner, repo } = parseRepositoryUrl(repositoryUrl);
    const { data } = await restGet(`/repos/${owner}/${repo}`);

    return {
        githubId: data.id,
        owner: data.owner.login,
        name: data.name,
        fullName: data.full_name,
        description: data.description ?? "",
        url: data.html_url,
        defaultBranch: data.default_branch,
        visibility: data.visibility,
        language: data.language ?? "",
        topics: data.topics ?? [],
        stars: data.stargazers_count,
        forks: data.forks_count,
        watchers: data.subscribers_count,
        openIssues: data.open_issues_count,
        createdAtGithub: data.created_at,
        updatedAtGithub: data.updated_at,
        pushedAt: data.pushed_at,
        ownerAvatar: data.owner.avatar_url,
    };
}

async function getCommits(repositoryUrl, since = null, { onProgress } = {}) {
    const { owner, repo } = parseRepositoryUrl(repositoryUrl);

    let commits;
    try {
        commits = await restPaginate(
            `/repos/${owner}/${repo}/commits`,
            since ? { since: new Date(since).toISOString() } : {},
            { maxItems: MAX_ITEMS, onProgress }
        );
    } catch (error) {
        // GitHub answers 409 for a repository without any commits
        if (error.status === 409) return [];
        throw error;
    }

    return commits.map((commit) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
            login: commit.author?.login ?? null,
            name: commit.commit.author?.name ?? null,
            email: commit.commit.author?.email ?? null,
            avatarUrl: commit.author?.avatar_url ?? null,
        },
        committedAt: commit.commit.author?.date,
        url: commit.html_url,
    }));
}

async function getContributors(repositoryUrl, { onProgress } = {}) {
    const { owner, repo } = parseRepositoryUrl(repositoryUrl);

    let contributors;
    try {
        contributors = await restPaginate(
            `/repos/${owner}/${repo}/contributors`,
            {},
            { onProgress }
        );
    } catch (error) {
        // very large histories: "contributor list is too large to list via the API"
        if (error.status === 403 && /too large/i.test(error.message)) return [];
        throw error;
    }

    return contributors
        .filter((contributor) => contributor.type !== "Bot")
        .map((contributor) => ({
            githubId: contributor.id,
            login: contributor.login,
            name: null,
            avatarUrl: contributor.avatar_url ?? null,
            profileUrl: contributor.html_url ?? null,
            contributions: contributor.contributions ?? 0,
        }));
}

async function getReleases(repositoryUrl, { onProgress } = {}) {
    const { owner, repo } = parseRepositoryUrl(repositoryUrl);

    const releases = await restPaginate(
        `/repos/${owner}/${repo}/releases`,
        {},
        { maxItems: MAX_ITEMS, onProgress }
    );

    return releases.map((release) => ({
        githubId: release.id,
        tagName: release.tag_name,
        name: release.name ?? null,
        body: release.body ?? null,
        author: {
            login: release.author?.login ?? null,
            avatarUrl: release.author?.avatar_url ?? null,
        },
        draft: release.draft ?? false,
        prerelease: release.prerelease ?? false,
        createdAtGithub: release.created_at,
        publishedAtGithub: release.published_at,
        url: release.html_url,
    }));
}

// ---------- GraphQL: pull requests (with reviews) and issues ----------

const REVIEW_FIELDS = `
    databaseId
    state
    submittedAt
    body
    url
    author { login avatarUrl }
`;

// Diff stats and nested reviews are each cheap, but asking for both in one
// query makes GitHub ~3x slower per page. So PRs are walked twice in
// parallel, one query per concern, and merged by databaseId.
const pullRequestsQuery = (fields) => `
    query ($owner: String!, $repo: String!, $pageSize: Int!, $cursor: String) {
        repository(owner: $owner, name: $repo) {
            pullRequests(
                first: $pageSize
                after: $cursor
                orderBy: { field: UPDATED_AT, direction: DESC }
            ) {
                pageInfo { hasNextPage endCursor }
                nodes { ${fields} }
            }
        }
    }
`;

const PULL_REQUESTS_QUERY = pullRequestsQuery(`
    databaseId
    number
    title
    body
    state
    createdAt
    updatedAt
    closedAt
    mergedAt
    url
    additions
    deletions
    changedFiles
    author { login avatarUrl }
`);

const PULL_REQUEST_REVIEWS_QUERY = pullRequestsQuery(`
    databaseId
    number
    updatedAt
    reviews(first: 40) {
        pageInfo { hasNextPage endCursor }
        nodes { ${REVIEW_FIELDS} }
    }
`);

const MORE_REVIEWS_QUERY = `
    query ($owner: String!, $repo: String!, $number: Int!, $cursor: String) {
        repository(owner: $owner, name: $repo) {
            pullRequest(number: $number) {
                reviews(first: 100, after: $cursor) {
                    pageInfo { hasNextPage endCursor }
                    nodes { ${REVIEW_FIELDS} }
                }
            }
        }
    }
`;

const ISSUES_QUERY = `
    query ($owner: String!, $repo: String!, $pageSize: Int!, $cursor: String, $since: DateTime) {
        repository(owner: $owner, name: $repo) {
            issues(
                first: $pageSize
                after: $cursor
                orderBy: { field: UPDATED_AT, direction: DESC }
                filterBy: { since: $since }
            ) {
                pageInfo { hasNextPage endCursor }
                nodes {
                    databaseId
                    number
                    title
                    body
                    state
                    createdAt
                    updatedAt
                    closedAt
                    url
                    author { login avatarUrl }
                    labels(first: 20) { nodes { name } }
                    comments { totalCount }
                }
            }
        }
    }
`;

/**
 * Walks a cursor-paginated GraphQL connection. Heavy pages occasionally time
 * out on GitHub's side (502/504), so the page size halves and retries.
 */
async function paginateConnection({ query, variables, pick, pageSize, stopWhen, onProgress }) {
    const items = [];
    let cursor = null;
    let size = pageSize;

    while (items.length < MAX_ITEMS) {
        let connection;
        try {
            const data = await graphql(query, { ...variables, pageSize: size, cursor });
            connection = pick(data);
        } catch (error) {
            if (error.retryable && size > 10) {
                size = Math.floor(size / 2);
                continue;
            }
            throw error;
        }

        let reachedEnd = false;
        for (const node of connection.nodes) {
            if (stopWhen?.(node)) {
                reachedEnd = true;
                break;
            }
            items.push(node);
        }

        onProgress?.(items.length);

        if (reachedEnd || !connection.pageInfo.hasNextPage) break;
        cursor = connection.pageInfo.endCursor;
    }

    return items.slice(0, MAX_ITEMS);
}

function toReview(node) {
    return {
        githubId: node.databaseId,
        reviewer: {
            login: node.author?.login ?? null,
            avatarUrl: node.author?.avatarUrl ?? null,
        },
        state: node.state,
        submittedAt: node.submittedAt,
        body: node.body || null,
        url: node.url,
    };
}

// PENDING reviews are unsubmitted drafts; they have no submittedAt
const isSubmitted = (review) => review.state !== "PENDING" && review.submittedAt;

async function remainingReviews(owner, repo, number, cursor) {
    const reviews = [];
    while (cursor) {
        const data = await graphql(MORE_REVIEWS_QUERY, { owner, repo, number, cursor });
        const connection = data.repository.pullRequest.reviews;
        reviews.push(...connection.nodes);
        cursor = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null;
    }
    return reviews;
}

/**
 * Pull requests updated after `since` (all when null), newest first, each
 * with its submitted reviews attached as `reviews`. Reviews are fetched in
 * bulk alongside the PRs, so there's no per-PR request in the common case.
 */
async function getPullRequests(repositoryUrl, since = null, { onProgress } = {}) {
    const { owner, repo } = parseRepositoryUrl(repositoryUrl);
    const sinceDate = since ? new Date(since) : null;

    const walk = (query, progress) => paginateConnection({
        query,
        variables: { owner, repo },
        pick: (data) => data.repository.pullRequests,
        pageSize: 50,
        stopWhen: sinceDate ? (node) => new Date(node.updatedAt) <= sinceDate : null,
        onProgress: progress,
    });

    const [nodes, reviewNodes] = await Promise.all([
        walk(PULL_REQUESTS_QUERY, onProgress),
        walk(PULL_REQUEST_REVIEWS_QUERY),
    ]);

    // a PR updated between the two walks may be missing here; it simply gets
    // no reviews this time and is picked up again on the next sync
    const reviewsByPr = new Map(reviewNodes.map((node) => [node.databaseId, node.reviews]));

    return Promise.all(
        nodes.map(async (node) => {
            const reviews = reviewsByPr.get(node.databaseId);
            const reviewNodes = [...(reviews?.nodes ?? [])];
            if (reviews?.pageInfo.hasNextPage) {
                reviewNodes.push(
                    ...(await remainingReviews(owner, repo, node.number, reviews.pageInfo.endCursor))
                );
            }

            return {
                githubId: node.databaseId,
                number: node.number,
                title: node.title,
                body: node.body || null,
                // GraphQL reports MERGED separately; the model stores open/closed
                state: node.state === "OPEN" ? "open" : "closed",
                author: {
                    login: node.author?.login ?? null,
                    avatarUrl: node.author?.avatarUrl ?? null,
                },
                createdAtGithub: node.createdAt,
                updatedAtGithub: node.updatedAt,
                closedAt: node.closedAt,
                mergedAt: node.mergedAt,
                url: node.url,
                additions: node.additions ?? 0,
                deletions: node.deletions ?? 0,
                changedFiles: node.changedFiles ?? 0,
                reviews: reviewNodes.filter(isSubmitted).map(toReview),
            };
        })
    );
}

/** Issues (never PRs) updated after `since` (all when null), newest first. */
async function getIssues(repositoryUrl, since = null, { onProgress } = {}) {
    const { owner, repo } = parseRepositoryUrl(repositoryUrl);

    const nodes = await paginateConnection({
        query: ISSUES_QUERY,
        variables: { owner, repo, since: since ? new Date(since).toISOString() : null },
        pick: (data) => data.repository.issues,
        pageSize: 100,
        onProgress,
    });

    return nodes.map((node) => ({
        githubId: node.databaseId,
        number: node.number,
        title: node.title,
        body: node.body || null,
        state: node.state === "OPEN" ? "open" : "closed",
        author: {
            login: node.author?.login ?? null,
            avatarUrl: node.author?.avatarUrl ?? null,
        },
        labels: node.labels.nodes.map((label) => ({ name: label.name })),
        comments: node.comments.totalCount ?? 0,
        createdAtGithub: node.createdAt,
        updatedAtGithub: node.updatedAt,
        closedAt: node.closedAt,
        url: node.url,
    }));
}
