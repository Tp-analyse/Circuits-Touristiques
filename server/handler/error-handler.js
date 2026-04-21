function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    res.status(err.statusCode || 500).json({
        message: err.message || "Une erreur inconnue est survenue"
    });
}

module.exports = errorHandler;
