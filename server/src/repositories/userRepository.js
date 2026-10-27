import User from '../models/user.js';

export { findByEmail, findById, create };

// includes the password hash: only for checking credentials
async function findByEmail(email) {
    return await User.findOne({ email: email?.toLowerCase().trim() });
}

// used to load the session user, so the password hash is left out
async function findById(id) {
    return await User.findById(id).select("-password").lean();
}

async function create(userData) {
    return await User.create(userData);
}
