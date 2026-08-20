import * as githubService from "../services/github/githubAPI.service.js";
import * as repositoryRepository from "../repositories/repositoryRepository.js";

export { 
    handleImportRepository, 
    getRepositoryData,
    getRepositoryById,
    deleteRepositoryById,
    updateRepositoryById
};

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

async function getRepositoryData (req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const repositories = await repositoryRepository.findByUserId(req.user._id);
        return res.status(200).json({
            message: "Repositories of user retrieved successfully",
            repositories,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to fetch repositories of user",
        });
    }
}

async function getRepositoryById (req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const userId = req.user._id;
        const repoId = req.params.id;
        const repository = await repositoryRepository.findByIdAndUserId(repoId, userId);

        if (!repository) {
            return res.status(404).json({
                message: "Repository not found",
            });
        }

        return res.status(200).json({
            message: "Repository successfully retrieved by repo id",
            repository,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to retrieve specific repository",
        });
    }
}

async function deleteRepositoryById (req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

    const userId = req.user._id;
    const repoId = req.params.id;
    const deletedRepo = await repositoryRepository.deleteByIdAndUserId(repoId, userId);
    
    if (!deletedRepo) {
        return res.status(404).json({
            message: "Repository was not present",
        });
    }

    return res.status(200).json({
        message: "Repository successfully deleted by repo id",
        deletedRepo,
    });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to delete repository",
        });
    }
}

async function updateRepositoryById (req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            })
        }

        const userId = req.user._id;
        const repoId = req.params.id;

        const existingRepository = await repositoryRepository.findByIdAndUserId(
            repoId,
            userId
        );

        if (!existingRepository) {
            return res.status(404).json({
                message: "Repository not found"
            });
        }

        const repositoryData = await githubService.getRepository(
            existingRepository.url
        );

        const updatedRepository = await repositoryRepository.updateByIdAndUserId(
            repoId,
            userId,
            {
                ...repositoryData,
                userId,
                lastSynced: new Date(),
            }
        );
        
        return res.status(200).json({
            message: "Repository synchronized successfully",
            repository: updatedRepository,
        });
    } catch (error) {
        console.error(error);
        
        return res.status(500).json({
            message: "Failed to synchronize repository",
        });
    }
}