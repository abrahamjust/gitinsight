import axios, { all } from "axios";
import {env} from "../../config/env.js";

export {
    getRepository,
    getCommits,
    getPullRequests,
    getIssues,
    getContributors,
    getReleases
}

function extractRepositoryInfo(repositoryUrl) {
    const url = new URL(repositoryUrl);
    
    if (url.hostname !== "github.com") {
        throw new Error("Invalid Github repository URL");
    }

    const pathParts = url.pathname.split("/").filter(part => part.length > 0);

    if (pathParts.length < 2) {
        throw new Error("Invalid Github repository URL");
    }

    const owner = pathParts[0];
    const repo = pathParts[1];

    return {
        owner, repo,
    }
}

async function getRepository(repositoryUrl) {
    try {
        const { owner, repo } = extractRepositoryInfo(repositoryUrl);

        const response = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}`,
            {
                headers: {
                    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
                    Accept: "application/vnd.github+json",
                },
            }
        );

        const data = response.data;

        return {
            githubId: data.id,
            owner: data.owner.login,
            name: data.name,
            fullName: data.full_name,
            description: data.description,
            url: data.html_url,
            defaultBranch: data.default_branch,
            visibility: data.visibility,
            language: data.language,
            topics: data.topics,
            stars: data.stargazers_count,
            forks: data.forks_count,
            watchers: data.subscribers_count,
            openIssues: data.open_issues_count,
            createdAtGithub: data.created_at,
            updatedAtGithub: data.updated_at,
            pushedAt: data.pushed_at,
            ownerAvatar: data.owner.avatar_url,
        };

    } catch (error) {

        if (error.response?.status === 404) {
            throw new Error("Repository not found");
        }

        if (error.response?.status === 403) {
            throw new Error("GitHub API rate limit exceeded");
        }

        throw error;
    }
}

async function getCommits(repositoryUrl, perPage=100) {
    try {
        const { owner, repo } = extractRepositoryInfo(repositoryUrl);

        let page = 1;
        let allCommits = [];

        while (true) {
            const response = await axios.get(
                `https://api.github.com/repos/${owner}/${repo}/commits`,
                {
                    params: {
                        page,
                        per_page: perPage,
                    },
                    headers: {
                        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
                        Accept: "application/vnd.github+json",
                    },
                }
            );

            const commits = response.data;

            if (commits.length == 0) {
                break;
            }

            allCommits.push(
                ...commits.map(commit => ({
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
                }))
            );

            if (commits.length < perPage) {
                break;
            }

            page++;
        }

        return allCommits;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error("Can't import commits");
        }

        if (error.response?.status === 403) {
            throw new Error("GitHub API rate limit exceeded");
        }

        throw error;
    }
}

async function getPullRequests(repositoryUrl, perPage = 100) {
    try {
        const { owner, repo } = extractRepositoryInfo(repositoryUrl);

        let page = 1;
        let allPullRequests = [];

        while (true) {
            const response = await axios.get(
                `https://api.github.com/repos/${owner}/${repo}/pulls`,
                {
                    params: {
                        state: "all",
                        page,
                        per_page: perPage,
                    },
                    headers: {
                        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
                        Accept: "application/vnd.github+json",
                    },
                }
            );

            const pullRequests = response.data;

            if (pullRequests.length == 0) {
                break;
            }

            allPullRequests.push(
                ...pullRequests.map(pullRequest => ({
                    githubId: pullRequest.id,
                    number: pullRequest.number,
                    title: pullRequest.title,
                    body: pullRequest.body ?? null,

                    state: pullRequest.state,

                    author: {
                        login: pullRequest.user?.login ?? null,
                        avatarUrl: pullRequest.user?.avatar_url ?? null,
                    },

                    createdAtGithub: pullRequest.created_at,
                    updatedAtGithub: pullRequest.updated_at,
                    closedAt: pullRequest.closed_at,
                    mergedAt: pullRequest.merged_at,

                    url: pullRequest.html_url,

                    additions: pullRequest.additions ?? 0,
                    deletions: pullRequest.deletions ?? 0,
                    changedFiles: pullRequest.changed_files ?? 0,
                }))
            );

            if (pullRequests.length < perPage) {
                break;
            }

            page++;
        }
        return allPullRequests;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error("Can't import PRs");
        }

        if (error.response?.status === 403) {
            throw new Error("GitHub API rate limit exceeded");
        }

        throw error;
    }
}

async function getIssues(repositoryUrl, perPage = 100) {
    try {
        const { owner, repo } = extractRepositoryInfo(repositoryUrl);

        let page = 1;
        let allIssues = [];

        while (true) {
            const response = await axios.get(
                `https://api.github.com/repos/${owner}/${repo}/issues`,
                {
                    params: {
                        state: "all",
                        page,
                        per_page: perPage,
                    },
                    headers: {
                        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
                        Accept: "application/vnd.github+json",
                    },
                }
            );

            const issues = response.data;

            if (issues.length === 0) {
                break;
            }

            // filter the pull requests, we get those in issues too.
            const actualIssues = issues.filter(
                issue => !issue.pull_request
            );

            allIssues.push(
                ...actualIssues.map(issue => ({
                    githubId: issue.id,

                    number: issue.number,

                    title: issue.title,

                    body: issue.body ?? null,

                    state: issue.state,

                    author: {
                        login: issue.user?.login ?? null,
                        avatarUrl: issue.user?.avatar_url ?? null,
                    },

                    labels: issue.labels.map(label => ({
                        name: label.name,
                    })),

                    comments: issue.comments ?? 0,

                    createdAtGithub: issue.created_at,

                    updatedAtGithub: issue.updated_at,

                    closedAt: issue.closed_at,

                    url: issue.html_url,
                }))
            );

            if (issues.length < perPage) {
                break;
            }

            page++;
        }

        return allIssues;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error("Can't import issues");
        }

        if (error.response?.status === 403) {
            throw new Error("GitHub API rate limit exceeded");
        }

        throw error;
    }
}

async function getContributors(repositoryUrl, perPage = 100) {
    try {
        const { owner, repo } = extractRepositoryInfo(repositoryUrl);

        let page = 1;
        let allContributors = [];

        while (true) {
            const response = await axios.get(
                `https://api.github.com/repos/${owner}/${repo}/contributors`,
                {
                    params: {
                        page,
                        per_page: perPage,
                    },
                    headers: {
                        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
                        Accept: "application/vnd.github+json",
                    },
                }
            );

            const contributors = response.data;

            if (contributors.length === 0) {
                break;
            }

            const actualContributors = contributors.filter(
                contributor => contributor.type !== "Bot"
            );

            allContributors.push(
                ...actualContributors.map(contributor => ({
                    githubId: contributor.id,
                    login: contributor.login,
                    name: null,
                    avatarUrl: contributor.avatar_url ?? null,
                    profileUrl: contributor.html_url ?? null,
                    contributions: contributor.contributions ?? 0,
                }))
            );

            if (contributors.length < perPage) {
                break;
            }

            page++;
        }

        return allContributors;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error("Can't import issues");
        }

        if (error.response?.status === 403) {
            throw new Error("GitHub API rate limit exceeded");
        }

        throw error;
    }
}

async function getReleases(repositoryUrl, perPage = 100) {
    try {
        const { owner, repo } = extractRepositoryInfo(repositoryUrl);

        let page = 1;
        let allReleases = [];

        while (true) {
            const response = await axios.get(
                `https://api.github.com/repos/${owner}/${repo}/releases`,
                {
                    params: {
                        page,
                        per_page: perPage,
                    },
                    headers: {
                        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
                        Accept: "application/vnd.github+json",
                    },
                }
            );

            const releases = response.data;

            if (releases.length === 0) {
                break;
            }

            allReleases.push(
                ...releases.map(release => ({
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
                }))
            );

            if (releases.length < perPage) {
                break;
            }

            page++;
        }

        return allReleases;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error("Can't import releases data");
        }

        if (error.response?.status === 403) {
            throw new Error("GitHub API rate limit exceeded");
        }

        throw error;
    }
}

const releases = await getReleases(
    "https://github.com/abrahamjust/InventoryManagement",
    5
);

console.log("Total releases:", releases.length);
console.log(releases[0]);