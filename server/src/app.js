import express from "express";
import session from "express-session";
import passport from "passport";
import { RedisStore } from "connect-redis";
import "./config/passport.js";

import authRouter from "./routes/authRoutes.js";
import repositoryRouter from "./routes/repositoryRoutes.js";
import analyticsRouter from "./routes/analyticsRoutes.js";

import { env } from "./config/env.js";
import { redisClient } from "./config/database.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

if (env.NODE_ENV === "production") {
  // secure cookies behind a reverse proxy / load balancer
  app.set("trust proxy", 1);
}

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  // sessions live in Redis, so they survive server restarts
  store: new RedisStore({ client: redisClient, prefix: "session:" }),
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

app.use(passport.session());


// authentication routes
app.use("/auth", authRouter);
app.use("/repositories", repositoryRouter);
app.use("/analytics", analyticsRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
