export { requireAuth };

function requireAuth(req, res, next) {
    if (!req.isAuthenticated?.() || !req.user) {
        return res.status(401).json({
            message: "Authentication required",
        });
    }
    next();
}
