import * as userRepository from "../repositories/userRepository.js";
import passport from "passport";
import bcrypt from "bcryptjs";

export { handleLogout, handleSignup, handleLogin };

function handleLogout(req, res, next) {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.status(200).json({
            message: "Logged out successfully"
        });
    });
}

async function handleSignup(req, res) {
    const { username, email, password } = req.body;
    try {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await userRepository.create({
            username,
            email,
            password: hashedPassword
        });
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

function handleLogin(req, res, next) {
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/auth/login",
    })(req, res, next);
}  