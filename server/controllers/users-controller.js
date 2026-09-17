const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
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
    if (!client) {
        return next(new HttpError("Email ou mot de passe incorrect.", 401));
    }

    let passwordValide;
    try {
        passwordValide = await bcrypt.compare(password, client.password);
    } catch (error) {
        return next(new HttpError("Connexion échouée, veuillez réessayer.", 500));
    }

    if (!passwordValide) {
        return next(new HttpError("Email ou mot de passe incorrect.", 401));
    }

    const token = jwt.sign(
        { userId: client.clientId, email: client.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.status(200).json({ userId: client.clientId, token });
};

const inscription = async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return next(new HttpError("Données saisies invalides.", 422));
    }

    const { nom, prenom, telephone, email, password } = req.body;

    let existing;
    try {
        existing = await query('SELECT clientId FROM client WHERE email = ?', [email]);
    } catch (error) {
        return next(new HttpError("Inscription échouée, veuillez réessayer.", 500));
    }

    if (existing.length > 0) {
        return next(new HttpError("Cet email est déjà utilisé.", 422));
    }

    try {
        const hash = await bcrypt.hash(password, 12);
        await query(
            'INSERT INTO client (numTelephone, email, nomPrenom, password) VALUES (?, ?, ?, ?)',
            [telephone, email, `${prenom} ${nom}`, hash]
        );
    } catch (error) {
        return next(new HttpError("Inscription échouée, veuillez réessayer.", 500));
    }

    res.status(201).json({ message: "Compte créé avec succès." });
};

module.exports = { connexion, inscription };