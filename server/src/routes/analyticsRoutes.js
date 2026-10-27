import express from "express";
import { getAnalytics } from "../controllers/analyticsController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/:repositoryId", getAnalytics);

export default router;
