import Router from "express";
import { handleImportRepository } from "../controllers/repositoryController.js";


const repositoryRouter = Router();

repositoryRouter.post("/import", handleImportRepository);

export default repositoryRouter;