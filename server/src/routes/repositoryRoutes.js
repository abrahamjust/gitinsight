import Router from "express";
import { 
    handleImportRepository,
    getRepositoryData,
    getRepositoryById,
    deleteRepositoryById
} from "../controllers/repositoryController.js";


const repositoryRouter = Router();

repositoryRouter.post("/import", handleImportRepository);
repositoryRouter.get("/", getRepositoryData);
repositoryRouter.get("/:id", getRepositoryById);
repositoryRouter.delete("/:id", deleteRepositoryById);

export default repositoryRouter;