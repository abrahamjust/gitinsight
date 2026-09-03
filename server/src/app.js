import express from "express";
import session from "express-session";
import passport from "passport";
import "./config/passport.js";

import authRouter from "./routes/authRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";
import repositoryRouter from "./routes/repositoryRoutes.js";
import analyticsRouter from "./routes/analyticsRoutes.js";

import { env } from "./config/env.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.session());


// authentication routes
app.use("/auth", authRouter);
app.use(dashboardRouter);
app.use("/repositories", repositoryRouter);
app.use("/analytics", analyticsRouter);

export default app;