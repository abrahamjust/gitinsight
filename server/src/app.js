import express from "express";
import session from "express-session";
import passport from "passport";
import "./config/passport.js";
// import connectMongo from "./config/mongo.js";
// import connectRedis from "./config/redis.js";
import authRouter from "./routes/authRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";
import repositoryRouter from "./routes/repositoryRoutes.js";
// import userRoutes from "./routes/user.js";
// import repoRoutes from "./routes/repo.js";
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

export default app;