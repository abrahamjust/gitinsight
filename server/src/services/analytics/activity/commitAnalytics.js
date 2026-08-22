export {
    calculateActivity,
}

function calculateActivity (commits, contributors) {
    const totalCommits = commits.length;

    const activeContributors = new Set(
        commits
        .map(commit => commit.author?.login)
        .filter(Boolean)
    ).size;

    return {
        totalCommits,
        activeContributors
    };
}