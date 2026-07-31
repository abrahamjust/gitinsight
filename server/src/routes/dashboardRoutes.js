import { Router } from "express";

const dashboardRouter = Router();

dashboardRouter.get("/dashboard", (req, res) => {
    res.send(`Welcome ${req.user.username}`);
});

export default dashboardRouter;