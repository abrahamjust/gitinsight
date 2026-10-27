import { generateAnalytics } from "../services/analytics/analytics.service.js";
import * as repositoryRepository from "../repositories/repositoryRepository.js";

export { getAnalytics }

// behind requireAuth, so req.user is always set
async function getAnalytics(req, res) {
    try {
        const { repositoryId } = req.params;
        const userId = req.user._id;

        const repository = await repositoryRepository.findByIdAndUserId(repositoryId, userId);

        if (!repository) {
            return res.status(404).json({
                message: "Repository not found"
            });
        }
        const analytics = await generateAnalytics(repositoryId);

        res.status(200).json(analytics);

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                message: "Repository not found"
            });
        }

        console.error("Analytics error:", error);

        res.status(500).json({
            message: "Failed to generate repository analytics"
        });
    }
}
