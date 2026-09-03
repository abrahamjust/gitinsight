import { calculateContributorHealth } from "./dimensions/contributorHealth.js";

const contributors = {
    totalContributors: 12,
    totalContributions: 89,
    topContributor: {
        login: "code-health-devguide-copybara",
        contributions: 44,
    },
    topContributorShare: 49.44,
    topThreeContributorShare: 88.76,
    concentrationHHI: 0.346,
    estimatedBusFactor: 2,
};

console.dir(
    calculateContributorHealth(contributors),
    { depth: null }
);