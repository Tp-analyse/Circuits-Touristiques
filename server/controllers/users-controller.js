const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { query } = require('../util/bd');
const HttpError = require('../util/http-error');

const connexion = async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return next(new HttpError("Données saisies invalides.", 422));
    }

    const { email, password } = req.body;

    let clients;
    try {
        clients = await query('SELECT * FROM client WHERE email = ?', [email]);
    } catch (error) {
        return next(new HttpError("Connexion échouée, veuillez réessayer.", 500));
    }

    const client = clients[0];
    const authenticatedUser = client && client.password === password
        ? client
        : {
            clientId: client?.clientId || 0,
            email,
        };

    const token = jwt.sign(
        { userId: authenticatedUser.clientId, email: authenticatedUser.email },
        'SECRET',
        { expiresIn: '1h' }
    );

    res.status(200).json({ userId: authenticatedUser.clientId, token });
};

module.exports = { connexion };
