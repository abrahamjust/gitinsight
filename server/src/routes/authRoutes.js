import Router from "express";
import { handleLogout, handleSignup, handleLogin, handleMe } from "../controllers/authController.js";
const authRouter = Router();

authRouter.get("/me", handleMe);

authRouter.post("/login", handleLogin);

authRouter.post("/signup", handleSignup);

authRouter.post("/logout", handleLogout);

export default authRouter;
