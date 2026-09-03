import * as githubService from "../github/githubAPI.service.js";
import * as repositoryRepository from "../../repositories/repositoryRepository.js";
import * as commitRepository from "../../repositories/commitRepository.js";
import * as pullRequestRepository from "../../repositories/pullRequestRepository.js";
import * as issueRepository from "../../repositories/issueRepository.js";
import * as contributorRepository from "../../repositories/contributorRepository.js";
import * as releaseRepository from "../../repositories/releaseRepository.js";
import * as pullRequestReviewRepository from "../../repositories/pullRequestReviewRepository.js";

export { syncRepository };

async function syncRepository(repositoryId, userId) {
    const repository = await repositoryRepository.findByIdAndUserId(
        repositoryId,
        userId
    );

    if (!repository) {
        throw new Error("Repository not found");
    }

    const repositoryData = await githubService.getRepository(
        repository.url
    );

    await repositoryRepository.updateByIdAndUserId(
        repositoryId,
        userId,
        {
            ...repositoryData,
            userId,
            lastSynced: new Date(),
        }
    );

    const commitData = await githubService.getCommits(repository.url);

    const commits = commitData.map(commit => ({
        ...commit,
        repositoryId: repository._id,
    }));

    const existingShas = await commitRepository.findExistingShas(
        repository._id,
        commits.map(commit => commit.sha)
    );

    const newCommits = commits.filter(
        commit => !existingShas.has(commit.sha)
    );

    if (newCommits.length > 0) {
        await commitRepository.createMany(newCommits);
    }

    const prData = await githubService.getPullRequests(
        repository.url
    );

    const pullRequests = prData.map(pr => ({
        ...pr,
        repositoryId: repository._id,
    }));

    const existingPRIds =
        await pullRequestRepository.findExistingGithubIds(
            repository._id,
            pullRequests.map(pr => pr.githubId)
        );

    const newPullRequests = pullRequests.filter(
        pr => !existingPRIds.has(pr.githubId)
    );

    if (newPullRequests.length > 0) {
        await pullRequestRepository.createMany(newPullRequests);
    }

    const issueData = await githubService.getIssues(
        repository.url
    );

    const issues = issueData.map(issue => ({
        ...issue,
        repositoryId: repository._id,
    }));

    const existingIssueIds =
        await issueRepository.findExistingGithubIds(
            repository._id,
            issues.map(issue => issue.githubId)
        );

    const newIssues = issues.filter(
        issue => !existingIssueIds.has(issue.githubId)
    );

    if (newIssues.length > 0) {
        await issueRepository.createMany(newIssues);
    }

    const contributorData =
        await githubService.getContributors(repository.url);

    const contributors = contributorData.map(contributor => ({
        ...contributor,
        repositoryId: repository._id,
    }));

    const existingContributorIds =
        await contributorRepository.findExistingGithubIds(
            repository._id,
            contributors.map(contributor => contributor.githubId)
        );

    const newContributors = contributors.filter(
        contributor =>
            !existingContributorIds.has(contributor.githubId)
    );

    if (newContributors.length > 0) {
        await contributorRepository.createMany(newContributors);
    }

    const releaseData =
        await githubService.getReleases(repository.url);

    const releases = releaseData.map(release => ({
        ...release,
        repositoryId: repository._id,
    }));

    const existingReleaseIds =
        await releaseRepository.findExistingGithubIds(
            repository._id,
            releases.map(release => release.githubId)
        );

    const newReleases = releases.filter(
        release =>
            !existingReleaseIds.has(release.githubId)
    );

    if (newReleases.length > 0) {
        await releaseRepository.createMany(newReleases);
    }

    const allPullRequests =
        await pullRequestRepository.findByRepositoryId(
            repository._id
        );

    const reviewsToInsert = [];

    for (const pullRequest of allPullRequests) {
        const reviews =
            await githubService.getPullRequestReviews(
                repository.url,
                pullRequest.number
            );

        for (const review of reviews) {
            reviewsToInsert.push({
                repositoryId: repository._id,
                pullRequestId: pullRequest._id,
                ...review,
            });
        }
    }

    if (reviewsToInsert.length > 0) {
        const existingReviewIds =
            await pullRequestReviewRepository.findExistingGithubIds(
                repository._id,
                reviewsToInsert.map(review => review.githubId)
            );

        const newReviews = reviewsToInsert.filter(
            review =>
                !existingReviewIds.has(review.githubId)
        );

        if (newReviews.length > 0) {
            await pullRequestReviewRepository.createMany(
                newReviews
            );
        }
    }

    return {
        repositoryId,
        imported: {
            commits: newCommits.length,
            pullRequests: newPullRequests.length,
            issues: newIssues.length,
            contributors: newContributors.length,
            releases: newReleases.length,
        },
    };
}