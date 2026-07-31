import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import * as userRepository from "../repositories/userRepository.js";

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
        },
        async (email, password, done) => {
            try {
                const user = await userRepository.getUserByEmail(email);
                if (!user) {
                    return done(null, false, { message: "Incorrect username" });
                }
                
                const match = await bcrypt.compare(password, user.password);
                if (!match) {
                    return done(null, false, { message: "Incorrect password" });
                }
                return done(null, user);
            } catch(error) {
                return done(error);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userRepository.getUserById(id);
        done(null, user);
    } catch(error) {
        done(error);
    }
});