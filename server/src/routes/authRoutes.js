import Router from "express";
import { handleLogout, handleSignup, handleLogin } from "../controllers/authController.js";
const authRouter = Router();


authRouter.get("/login", (req, res) => {
  // Render login page or send login form
  res.send("Login page");
});

authRouter.get("/signup", (req, res) => {
  // Render signup page or send registration form
  res.send("Signup page");
}); 

authRouter.get("/me", (req, res) => {
    res.json({
        authenticated: req.isAuthenticated(),
        user: req.user || null,
    });
});


authRouter.post("/login", handleLogin);

authRouter.post("/signup", handleSignup);

authRouter.post("/logout", handleLogout);

export default authRouter;