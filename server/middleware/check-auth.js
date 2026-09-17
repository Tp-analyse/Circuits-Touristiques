const jwt = require('jsonwebtoken');
const HttpError = require('../util/http-error');

const checkAuth = (req, res, next) => {
    try {
        if (req.method === 'OPTIONS') {
            return next();
        }

        const token = req.headers.authorization;
        if (!token) {
            throw new HttpError('Authentification échouée', 401);
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = { userId: decodedToken.userId };
        next();
    } catch (error) {
        return next(new HttpError('Authentification échouée', 401));
    }
};

module.exports = checkAuth;
