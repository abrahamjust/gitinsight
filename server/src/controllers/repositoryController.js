import * as githubService from "../services/github/githubAPI.service.js";
import * as repositoryRepository from "../repositories/repositoryRepository.js";

export { handleImportRepository };

async function handleImportRepository (req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const { url } = req.body;
        if (!url) {
            return res.status(400).json({
                message: "Repository URL is required",
            });
        }

        const repositoryData = await githubService.getRepository(url);
        repositoryData.userId = req.user._id;

        const existingRepository = await repositoryRepository.findByGithubId(
            repositoryData.githubId
        );
        if (existingRepository) {
            return res.status(409).json({
                message: "Repository already imported",
                repository: existingRepository,
            });
        }

        const repository = await repositoryRepository.create(repositoryData);
        return res.status(201).json({
            message: "Repository imported successfully",
            repository,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to import repository",
        });
    }
}