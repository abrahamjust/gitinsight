export { calculatePRReviewAnalytics };

function calculatePRReviewAnalytics(pullRequests, reviews) {

    const totalReviews = reviews.length;

    const reviewerLogins = reviews
        .map((review) => review.reviewer?.login)
        .filter(Boolean);

    const uniqueReviewers = new Set(reviewerLogins).size;

    const approvedReviews = reviews.filter(
        (review) => review.state === "APPROVED"
    ).length;

    const changesRequested = reviews.filter(
        (review) => review.state === "CHANGES_REQUESTED"
    ).length;

    const commentedReviews = reviews.filter(
        (review) => review.state === "COMMENTED"
    ).length;

    const dismissedReviews = reviews.filter(
        (review) => review.state === "DISMISSED"
    ).length;

    const reviewsByPR = new Map();

    for (const review of reviews) {
        const prId = review.pullRequestId?.toString();

        if (!prId) {
        continue;
        }

        if (!reviewsByPR.has(prId)) {
        reviewsByPR.set(prId, []);
        }

        reviewsByPR.get(prId).push(review);
    }

    const reviewedPRs = reviewsByPR.size;

    const prsWithoutReview = pullRequests.filter(
        (pullRequest) =>
        !reviewsByPR.has(pullRequest._id.toString())
    ).length;

    const totalPRs = pullRequests.length;

    const reviewCoverage =
        totalPRs === 0
        ? 0
        : Number(((reviewedPRs / totalPRs) * 100).toFixed(2));

    const timeToFirstReviewHours = [];

    for (const pullRequest of pullRequests) {
        const prId = pullRequest._id.toString();

        const prReviews = reviewsByPR.get(prId);

        if (!prReviews || prReviews.length === 0) {
            continue;
        }

        const createdAt = new Date(pullRequest.createdAtGithub);

        const firstReview = [...prReviews].sort(
        (a, b) =>
            new Date(a.submittedAt) -
            new Date(b.submittedAt)
        )[0];

        const submittedAt = new Date(firstReview.submittedAt);

        const differenceHours =
        (submittedAt - createdAt) / (1000 * 60 * 60);

        if (differenceHours >= 0) {
            timeToFirstReviewHours.push(differenceHours);
        }
    }

    const averageTimeToFirstReviewHours =
        calculateAverage(timeToFirstReviewHours);

    const medianTimeToFirstReviewHours =
        calculateMedian(timeToFirstReviewHours);

    const reviewerCounts = new Map();

    for (const review of reviews) {
        const login = review.reviewer?.login;

        if (!login) {
            continue;
        }

        reviewerCounts.set(
            login,
            (reviewerCounts.get(login) || 0) + 1
        );
    }

    const reviewerRanking = [...reviewerCounts.entries()]
        .map(([login, reviewCount]) => ({
            login,
            reviews: reviewCount,
        }))
        .sort((a, b) => b.reviews - a.reviews);

    const topReviewer =
        reviewerRanking.length > 0
        ? reviewerRanking[0]
        : null;

    let reviewerConcentration = 0;

    if (totalReviews > 0) {
        reviewerConcentration = Number(
        reviewerRanking
            .reduce((sum, reviewer) => {
                const share = reviewer.reviews / totalReviews;
                return sum + share * share;
            }, 0)
            .toFixed(3)
        );
    }

    return {
        totalReviews,
        uniqueReviewers,
        approvedReviews,
        changesRequested,
        commentedReviews,
        dismissedReviews,
        reviewedPRs,
        prsWithoutReview,
        reviewCoverage,
        averageTimeToFirstReviewHours,
        medianTimeToFirstReviewHours,
        topReviewer,
        reviewerConcentration,
    };
}

function calculateAverage(values) {
    if (values.length === 0) {
        return 0;
    }

    const total = values.reduce((sum, value) => sum + value, 0);

    return Number((total / values.length).toFixed(2));
}

function calculateMedian(values) {
    if (values.length === 0) {
        return 0;
    }

    const sorted = [...values].sort((a, b) => a - b);

    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return Number(
            ((sorted[middle - 1] + sorted[middle]) / 2).toFixed(2)
        );
    }

    return Number(sorted[middle].toFixed(2));
}