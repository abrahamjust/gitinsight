import User from '../models/user.js';

export { findByEmail, findById, create };

async function findByEmail(email) {
    return await User.findOne({ email });
}

async function findById(id) {
    return await User.findById(id);
}

async function create(userData) {
    return await User.create(userData);
}