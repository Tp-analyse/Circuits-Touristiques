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

    if (!client || client.password !== password) {
        return next(new HttpError("Identifiants invalides.", 401));
    }

    const token = jwt.sign(
        { userId: client.clientId, email: client.email },
        'SECRET',
        { expiresIn: '1h' }
    );

    res.status(200).json({ userId: client.clientId, token });
};

module.exports = { connexion };
