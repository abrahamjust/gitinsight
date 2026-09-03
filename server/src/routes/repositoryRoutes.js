import Router from "express";
import { 
    handleImportRepository,
    getRepositoryData,
    getRepositoryById,
    deleteRepositoryById,
    updateRepositoryById,
    importCommits,
    importPullRequests,
    importIssues,
    importContributors,
    importReleases,
    importPullRequestReviews
} from "../controllers/repositoryController.js";


const repositoryRouter = Router();

repositoryRouter.post("/import", handleImportRepository);
repositoryRouter.get("/", getRepositoryData);
repositoryRouter.get("/:id", getRepositoryById);
repositoryRouter.delete("/:id", deleteRepositoryById);
repositoryRouter.patch("/:id/sync", updateRepositoryById);
repositoryRouter.post("/:id/commits/import", importCommits);
repositoryRouter.post("/:id/pull-requests/import", importPullRequests);
repositoryRouter.post("/:id/issues/import", importIssues);
repositoryRouter.post("/:id/contributors/import", importContributors);
repositoryRouter.post("/:id/releases/import", importReleases);
repositoryRouter.post("/:id/pull-request-reviews/import", importPullRequestReviews);

export default repositoryRouter;