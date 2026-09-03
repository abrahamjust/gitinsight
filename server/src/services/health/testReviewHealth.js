import { calculateReviewHealth } from "./dimensions/reviewHealth.js";


const reviews = {
    totalReviews: 76,
    uniqueReviewers: 17,
    approvedReviews: 13,
    changesRequested: 2,
    commentedReviews: 61,
    dismissedReviews: 0,
    reviewedPRs: 16,
    prsWithoutReview: 32,
    reviewCoverage: 33.33,
    averageTimeToFirstReviewHours: 3424.02,
    medianTimeToFirstReviewHours: 42.25,
    topReviewer: {
        login: "poponybing",
        reviews: 51,
    },
    reviewerConcentration: 0.46,
};


console.dir(
    calculateReviewHealth(reviews),
    { depth: null }
);