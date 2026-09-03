import { generateAnalytics } from "../services/analytics/analytics.service.js";
export { getAnalytics }

async function getAnalytics(req, res) {
    try {
        const { repositoryId } = req.params;

        const analytics = await generateAnalytics(repositoryId);

        res.status(200).json(analytics);
    } catch (error) {
        console.error("Analytics error:", error);

        res.status(500).json({
            message: "Failed to generate repository analytics"
        });
    }
}