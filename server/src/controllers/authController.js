import * as userRepository from "../repositories/userRepository.js";
import passport from "passport";
import bcrypt from "bcryptjs";

export { handleLogout, handleSignup, handleLogin, handleMe };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

// never send the password hash (or anything else internal) to the client
function toPublicUser(user) {
    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
    };
}

function logIn(req, user) {
    return new Promise((resolve, reject) => {
        req.login(user, (err) => (err ? reject(err) : resolve()));
    });
}

function handleMe(req, res) {
    const authenticated = req.isAuthenticated();
    res.json({
        authenticated,
        user: authenticated ? toPublicUser(req.user) : null,
    });
}

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

async function handleSignup(req, res, next) {
    const username = req.body?.username?.trim();
    const email = req.body?.email?.trim().toLowerCase();
    const password = req.body?.password;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email and password are required" });
    }
    if (!EMAIL_PATTERN.test(email)) {
        return res.status(400).json({ message: "Enter a valid email address" });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    try {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: "An account with that email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userRepository.create({
            username,
            email,
            password: hashedPassword
        });

        // sign the new user straight in
        await logIn(req, user);

        res.status(201).json({
            message: "User created successfully",
            user: toPublicUser(user),
        });
    } catch (error) {
        // two signups racing for the same email hit the unique index
        if (error.code === 11000) {
            return res.status(409).json({ message: "An account with that email already exists" });
        }
        next(error);
    }
}

function handleLogin(req, res, next) {
    passport.authenticate("local", async (err, user) => {
        if (err) {
            return next(err);
        }

        // same message either way, so the response doesn't reveal which emails exist
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        try {
            await logIn(req, user);
            res.status(200).json({
                message: "Logged in successfully",
                user: toPublicUser(user),
            });
        } catch (error) {
            next(error);
        }
    })(req, res, next);
}
