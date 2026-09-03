export { detectReleaseBottlenecks };

function detectReleaseBottlenecks(releases, health) {
    const bottlenecks = [];

    if (
        !releases ||
        !health ||
        health.status === "not_applicable"
    ) {
        return bottlenecks;
    }

    // Release-specific rules will go here.

    return bottlenecks;
}