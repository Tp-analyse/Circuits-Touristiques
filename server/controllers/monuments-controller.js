const { validationResult } = require('express-validator');
const { query } = require('../util/bd');
const HttpError = require('../util/http-error');

const getAllMonuments = async (req, res, next) => {
    let monuments;
    try {
        monuments = await query('SELECT * FROM monument');
    } catch (error) {
        return next(new HttpError("Erreur lors de la récupération des monuments.", 500));
    }
    res.json({ monuments });
};

const getMonumentById = async (req, res, next) => {
    const { id } = req.params;

    let monuments;
    try {
        monuments = await query('SELECT * FROM monument WHERE id = ?', [id]);
    } catch (error) {
        return next(new HttpError("Erreur lors de la récupération du monument.", 500));
    }

    if (!monuments[0]) {
        return next(new HttpError("Monument non trouvé.", 404));
    }

    res.json({ monument: monuments[0] });
};

const creerMonument = async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return next(new HttpError("Données saisies invalides.", 422));
    }

    const { nom, date_construction, resume_histoire, prix } = req.body;

    let result;
    try {
        result = await query(
            'INSERT INTO monument (nom, date_construction, resume_histoire, prix) VALUES (?, ?, ?, ?)',
            [nom, date_construction, resume_histoire, prix]
        );
    } catch (error) {
        return next(new HttpError("Création du monument échouée.", 500));
    }

    res.status(201).json({ monument: { id: result.insertId, nom, date_construction, resume_histoire, prix, nb_etoiles: 0 } });
};

const modifierMonument = async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return next(new HttpError("Données saisies invalides.", 422));
    }

    const { id } = req.params;
    const { nom, date_construction, resume_histoire, prix, nb_etoiles } = req.body;

    let monuments;
    try {
        monuments = await query('SELECT * FROM monument WHERE id = ?', [id]);
    } catch (error) {
        return next(new HttpError("Erreur lors de la récupération du monument.", 500));
    }

    if (!monuments[0]) {
        return next(new HttpError("Monument non trouvé.", 404));
    }

    try {
        await query(
            'UPDATE monument SET nom=?, date_construction=?, resume_histoire=?, prix=?, nb_etoiles=? WHERE id=?',
            [nom, date_construction, resume_histoire, prix, nb_etoiles, id]
        );
    } catch (error) {
        return next(new HttpError("Mise à jour échouée.", 500));
    }

    res.json({ monument: { id: Number(id), nom, date_construction, resume_histoire, prix, nb_etoiles } });
};

const supprimerMonument = async (req, res, next) => {
    const { id } = req.params;

    let monuments;
    try {
        monuments = await query('SELECT * FROM monument WHERE id = ?', [id]);
    } catch (error) {
        return next(new HttpError("Erreur lors de la récupération du monument.", 500));
    }

    if (!monuments[0]) {
        return next(new HttpError("Monument non trouvé.", 404));
    }

    try {
        await query('DELETE FROM circuit_monument WHERE monument_id = ?', [id]);

        await query('DELETE FROM monument WHERE id = ?', [id]);
    } catch (error) {
        return next(new HttpError("Suppression échouée.", 500));
    }

    res.json({ message: "Monument supprimé avec succès." });
};


module.exports = { getAllMonuments, getMonumentById, creerMonument, modifierMonument, supprimerMonument };
