import { generateAnalytics } from "../services/analytics/analytics.service.js";
import * as repositoryRepository from "../repositories/repositoryRepository.js";

export { getAnalytics }

async function getAnalytics(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

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
        console.error("Analytics error:", error);

        res.status(500).json({
            message: "Failed to generate repository analytics"
        });
    }
}