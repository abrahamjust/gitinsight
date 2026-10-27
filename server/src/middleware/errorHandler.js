export { notFound, errorHandler };

function notFound(req, res) {
    res.status(404).json({
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
}

// Express 5 forwards rejected async handlers here as well.
// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
    // malformed ObjectId in the URL
    if (error.name === "CastError") {
        return res.status(404).json({
            message: "Not found",
        });
    }

    console.error(error);

    const status = error.status && error.status >= 400 && error.status < 600
        ? error.status
        : 500;

    res.status(status).json({
        message: status === 500 ? "Internal server error" : error.message,
    });
}
