import axios from "axios";
import {env} from "../../config/env.js";

export {
    getRepository,
    getCommits,
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

const commits = await getCommits(
    "https://github.com/abrahamjust/InventoryManagement",
    5
);

console.log("Total commits:", commits.length);
console.log(commits[0]);
console.log(commits[commits.length - 1]);