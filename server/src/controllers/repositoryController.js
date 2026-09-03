import * as githubService from "../services/github/githubAPI.service.js";
import * as repositoryRepository from "../repositories/repositoryRepository.js";
import * as commitRepository from "../repositories/commitRepository.js";
import * as pullRequestRepository from "../repositories/pullRequestRepository.js";
import * as issueRepository from "../repositories/issueRepository.js";
import * as contributorRepository from "../repositories/contributorRepository.js";
import * as releaseRepository from "../repositories/releaseRepository.js";
import * as pullRequestReviewRepository from "../repositories/pullRequestReviewRepository.js";

import { syncQueue } from "../services/jobs/syncQueue.js";

import { deleteCache } from "../services/cache/redisService.js";

export { 
    handleImportRepository, 
    getRepositoryData,
    getRepositoryById,
    deleteRepositoryById,
    updateRepositoryById,
    importCommits,
    importPullRequests,
    importIssues,
    importContributors,
    importReleases,
    importPullRequestReviews,
    getSyncStatus
};

async function handleImportRepository (req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const { url } = req.body;
        if (!url) {
            return res.status(400).json({
                message: "Repository URL is required",
            });
        }

        const repositoryData = await githubService.getRepository(url);
        repositoryData.userId = req.user._id;

        const existingRepository = await repositoryRepository.findByGithubId(
            repositoryData.githubId
        );
        if (existingRepository) {
            return res.status(409).json({
                message: "Repository already imported",
                repository: existingRepository,
            });
        }

        const repository = await repositoryRepository.create(repositoryData);
        return res.status(201).json({
            message: "Repository imported successfully",
            repository,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to import repository",
        });
    }
}

async function getRepositoryData (req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const repositories = await repositoryRepository.findByUserId(req.user._id);
        return res.status(200).json({
            message: "Repositories of user retrieved successfully",
            repositories,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to fetch repositories of user",
        });
    }
}

async function getRepositoryById (req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const userId = req.user._id;
        const repoId = req.params.id;
        const repository = await repositoryRepository.findByIdAndUserId(repoId, userId);

        if (!repository) {
            return res.status(404).json({
                message: "Repository not found",
            });
        }

        return res.status(200).json({
            message: "Repository successfully retrieved by repo id",
            repository,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to retrieve specific repository",
        });
    }
}

async function deleteRepositoryById (req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

    const userId = req.user._id;
    const repoId = req.params.id;
    const deletedRepo = await repositoryRepository.deleteByIdAndUserId(repoId, userId);
    
    if (!deletedRepo) {
        return res.status(404).json({
            message: "Repository was not present",
        });
    }

    await deleteCache(`analytics:${repoId}`);

    return res.status(200).json({
        message: "Repository successfully deleted by repo id",
        deletedRepo,
    });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to delete repository",
        });
    }
}

async function updateRepositoryById(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const userId = req.user._id;
        const repoId = req.params.id;

        const existingRepository =
            await repositoryRepository.findByIdAndUserId(
                repoId,
                userId
            );

        if (!existingRepository) {
            return res.status(404).json({
                message: "Repository not found",
            });
        }

        if (
            existingRepository.analyticsStatus === "pending" ||
            existingRepository.analyticsStatus === "processing"
        ) {
            return res.status(409).json({
                message: "Repository synchronization is already in progress",
                status: existingRepository.analyticsStatus,
            });
        }

        await repositoryRepository.updateByIdAndUserId(repoId, userId, { analyticsStatus: "pending"});

        const job = await syncQueue.add(
            "sync-repository",
            {
                repositoryId: repoId,
                userId,
            },
            {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 5000,
                },
                removeOnComplete: true,
                removeOnFail: false,
            }
        );

        return res.status(202).json({
            message: "Repository synchronization started",
            jobId: job.id,
            status: "pending",
        });

    } catch (error) {
        console.error("Sync error:", error);

        return res.status(500).json({
            message: "Failed to start repository synchronization",
        });
    }
}

async function importCommits (req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const userId = req.user._id;
        const repoId = req.params.id;

        const repository = await repositoryRepository.findByIdAndUserId(
            repoId,
            userId
        );

        if (!repository) {
            return res.status(404).json({
                message: "Repository not found"
            });
        }
        
        const repoUrl = repository.url;
        const commitData = await githubService.getCommits(repoUrl);

        const commits = commitData.map(commit => ({
            ...commit,
            repositoryId: repository._id,
        }));

        const existingShas = await commitRepository.findExistingShas(repository._id, commits.map(commit => commit.sha));

        const newCommits = commits.filter(
            commit => !existingShas.has(commit.sha)
        );

        if (newCommits.length > 0) {
            await commitRepository.createMany(newCommits);
            await deleteCache(`analytics:${repoId}`);
        }
        
        return res.status(201).json({
            message: "Commits imported successfully",
            imported: newCommits.length,
            skipped: commits.length - newCommits.length,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to import commits"
        })
    }
}

async function importPullRequests (req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const userId = req.user._id;
        const repoId = req.params.id;

        const repository = await repositoryRepository.findByIdAndUserId(
            repoId,
            userId
        );

        if (!repository) {
            return res.status(404).json({
                message: "Repository not found"
            });
        }
        
        const repoUrl = repository.url;
        const prData = await githubService.getPullRequests(repoUrl);

        const pullRequests = prData.map(pr => ({
            ...pr,
            repositoryId: repository._id,
        }));

        const existingGithubIds = await pullRequestRepository.findExistingGithubIds(
            repository._id,
            pullRequests.map(pr => pr.githubId)
        );

        const newPullRequests = pullRequests.filter(
            pr => !existingGithubIds.has(pr.githubId)
        );

        
        if (newPullRequests.length > 0) {
            await pullRequestRepository.createMany(newPullRequests);
            await deleteCache(`analytics:${repoId}`);
        }

        return res.status(201).json({
            message: "PRs imported successfully",
            imported: newPullRequests.length,
            skipped: pullRequests.length - newPullRequests.length,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to import PRs"
        })
    }
}

async function importIssues (req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const userId = req.user._id;
        const repoId = req.params.id;

        const repository =
            await repositoryRepository.findByIdAndUserId(
                repoId,
                userId
            );

        if (!repository) {
            return res.status(404).json({
                message: "Repository not found",
            });
        }

        const issueData =
            await githubService.getIssues(repository.url);

        const issues = issueData.map(issue => ({
            ...issue,
            repositoryId: repository._id,
        }));

        const existingGithubIds =
            await issueRepository.findExistingGithubIds(
                repository._id,
                issues.map(issue => issue.githubId)
            );

        const newIssues = issues.filter(
            issue => !existingGithubIds.has(issue.githubId)
        );

        if (newIssues.length > 0) {
            await issueRepository.createMany(newIssues);
            await deleteCache(`analytics:${repoId}`);
        }

        return res.status(201).json({
            message: "Issues imported successfully",
            imported: newIssues.length,
            skipped: issues.length - newIssues.length,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to import issues"
        })
    }
}

async function importContributors(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const userId = req.user._id;
        const repoId = req.params.id;

        const repository =
            await repositoryRepository.findByIdAndUserId(
                repoId,
                userId
            );

        if (!repository) {
            return res.status(404).json({
                message: "Repository not found",
            });
        }

        const contributorData =
            await githubService.getContributors(
                repository.url
            );

        const contributors = contributorData.map(contributor => ({
            ...contributor,
            repositoryId: repository._id,
        }));

        const existingGithubIds =
            await contributorRepository.findExistingGithubIds(
                repository._id,
                contributors.map(
                    contributor => contributor.githubId
                )
            );

        const newContributors = contributors.filter(
            contributor =>
                !existingGithubIds.has(
                    contributor.githubId
                )
        );

        if (newContributors.length > 0) {
            await contributorRepository.createMany(
                newContributors
            );
            await deleteCache(`analytics:${repoId}`);
        }

        return res.status(201).json({
            message: "Contributors imported successfully",
            imported: newContributors.length,
            skipped:
                contributors.length -
                newContributors.length,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to import contributors",
        });
    }
}

async function importReleases(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const userId = req.user._id;
        const repoId = req.params.id;

        const repository =
            await repositoryRepository.findByIdAndUserId(
                repoId,
                userId
            );

        if (!repository) {
            return res.status(404).json({
                message: "Repository not found",
            });
        }

        const releaseData =
            await githubService.getReleases(
                repository.url
            );

        const releases = releaseData.map(release => ({
            ...release,
            repositoryId: repository._id,
        }));

        const existingGithubIds =
            await releaseRepository.findExistingGithubIds(
                repository._id,
                releases.map(release => release.githubId)
            );

        const newReleases = releases.filter(
            release =>
                !existingGithubIds.has(release.githubId)
        );

        if (newReleases.length > 0) {
            await releaseRepository.createMany(
                newReleases
            );
            await deleteCache(`analytics:${repoId}`);
        }

        return res.status(201).json({
            message: "Releases imported successfully",
            imported: newReleases.length,
            skipped:
                releases.length -
                newReleases.length,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to import releases",
        });
    }
}

async function importPullRequestReviews(req, res) {
    try {
        
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const userId = req.user._id;
        const repoId = req.params.id;

        const repository = await repositoryRepository.findByIdAndUserId(repoId, userId);

        if (!repository) {
            return res.status(404).json({
                message: "Repository not found",
            });
        }

        const pullRequests = await pullRequestRepository.findByRepositoryId(repoId);

        if (pullRequests.length === 0) {
            return res.status(400).json({
                message: "No pull requests found for this repository",
            });
        }

        let reviewsToInsert = [];

        for (const pullRequest of pullRequests) {
            const reviews = await githubService.getPullRequestReviews(
                repository.url,
                pullRequest.number
            );

            for (const review of reviews) {
                reviewsToInsert.push({
                    repositoryId: repoId,
                    pullRequestId: pullRequest._id,
                    ...review,
                });
            }
        }

        if (reviewsToInsert.length === 0) {
            return res.status(200).json({
                message: "No pull request reviews found",
                imported: 0,
                skipped: 0,
            });
        }

        const githubIds = reviewsToInsert.map(
            (review) => review.githubId
        );

        const existingGithubIds = await pullRequestReviewRepository.findExistingGithubIds(
            repoId,
            githubIds
        );

        const newReviews = reviewsToInsert.filter(
            (review) => !existingGithubIds.has(review.githubId)
        );

        if (newReviews.length > 0) {
            await pullRequestReviewRepository.createMany(newReviews);
            await deleteCache(`analytics:${repoId}`);
        }

        return res.status(200).json({
            message: "Pull request reviews imported successfully",
            imported: newReviews.length,
            skipped: reviewsToInsert.length - newReviews.length,
        });
    } catch (error) {
        console.error("Error importing pull request reviews:", error);

        return res.status(500).json({
            message: "Failed to import pull request reviews",
            error: error.message,
        });
    }
}

async function getSyncStatus(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const userId = req.user._id;
        const repoId = req.params.id;

        const repository =
            await repositoryRepository.findByIdAndUserId(
                repoId,
                userId
            );

        if (!repository) {
            return res.status(404).json({
                message: "Repository not found",
            });
        }

        return res.status(200).json({
            repositoryId: repository._id,
            status: repository.analyticsStatus,
            lastSynced: repository.lastSynced,
        });

    } catch (error) {
        console.error("Sync status error:", error);

        return res.status(500).json({
            message: "Failed to retrieve synchronization status",
        });
    }
}