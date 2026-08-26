export {
    calculateContributors
};

function calculateContributors (contributors) {
    const totalContributors = contributors.length;

    const totalContributions = contributors.reduce(
        (total, contributor) =>
            total + (contributor.contributions || 0),
        0
    );

    if (totalContributors === 0 || totalContributions === 0) {
        return {
            totalContributors: 0,
            totalContributions: 0,
            topContributor: null,
            topContributorShare: 0,
            topThreeContributorShare: 0,
            concentrationHHI: 0,
            estimatedBusFactor: 0,
        };
    }

    const sortedContributors = [...contributors].sort(
        (a, b) =>
            (b.contributions || 0) -
            (a.contributions || 0)
    );

    const topContributor =
        sortedContributors[0];

    const topContributorShare =
        (
            topContributor.contributions /
            totalContributions
        ) * 100;

    const topThreeContributions =
        sortedContributors
            .slice(0, 3)
            .reduce(
                (total, contributor) =>
                    total +
                    (contributor.contributions || 0),
                0
            );

    const topThreeContributorShare =
        (
            topThreeContributions /
            totalContributions
        ) * 100;

    const concentrationHHI =
        calculateHHI(
            sortedContributors,
            totalContributions
        );

    const estimatedBusFactor =
        calculateBusFactor(
            sortedContributors,
            totalContributions
        );

    return {
        totalContributors,

        totalContributions,

        topContributor: {
            login: topContributor.login,
            contributions: topContributor.contributions,
        },

        topContributorShare: Number(
            topContributorShare.toFixed(2)
        ),

        topThreeContributorShare: Number(
            topThreeContributorShare.toFixed(2)
        ),

        concentrationHHI: Number(
            concentrationHHI.toFixed(4)
        ),

        estimatedBusFactor,
    };
}

function calculateHHI (contributors, totalContributions) {
    let hhi = 0;

    for (const contributor of contributors) {
        const share =
            contributor.contributions /
            totalContributions;

        hhi += share * share;
    }

    return hhi;
}

function calculateBusFactor (contributors, totalContributions) {
    const target =
        totalContributions * 0.5;

    let accumulated = 0;

    for (let i = 0; i < contributors.length; i++) {
        accumulated +=
            contributors[i].contributions || 0;

        if (accumulated >= target) {
            return i + 1;
        }
    }

    return contributors.length;
}