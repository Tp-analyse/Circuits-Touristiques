const { validationResult } = require('express-validator');
const { query } = require('../util/bd');
const HttpError = require('../util/http-error');
const Guide = require('../models/guide-model');

const getAllGuides = async (req, res, next) => {
    let guides;
    try {
        guides = await query('SELECT * FROM guide ORDER BY nom ASC, prenom ASC');
    } catch (error) {
        return next(new HttpError("Erreur lors de la récupération des guides.", 500));
    }
    res.json({ guides });
};

const creerGuide = async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return next(new HttpError("Données saisies invalides.", 422));
    }

    const { nom, prenom } = req.body;

    let result;
    try {
        result = await query('INSERT INTO guide (nom, prenom) VALUES (?, ?)', [nom, prenom]);
    } catch (error) {
        return next(new HttpError("Création du guide échouée.", 500));
    }

    res.status(201).json({ guide: { id: result.insertId, nom, prenom } });
};

const supprimerGuide = async (req, res, next) => {
    const { id } = req.params;

    let guides;
    try {
        guides = await query('SELECT * FROM guide WHERE id = ?', [id]);
    } catch (error) {
        return next(new HttpError("Erreur lors de la récupération du guide.", 500));
    }

    if (!guides[0]) {
        return next(new HttpError("Guide non trouvé.", 404));
    }

    try {
        await query('DELETE FROM guide WHERE id = ?', [id]);
    } catch (error) {
        return next(new HttpError("Suppression du guide échouée.", 500));
    }

    res.json({ message: "Guide supprimé avec succès." });
};

const assignerGuide = async (req, res, next) => {
    const { id } = req.params;
    const { guide_id } = req.body;

    if (!guide_id || !Number.isInteger(Number(guide_id)) || Number(guide_id) <= 0) {
        return next(new HttpError("Identifiant de guide invalide.", 422));
    }

    let circuits;
    try {
        circuits = await query('SELECT * FROM circuit WHERE id = ?', [id]);
    } catch (error) {
        return next(new HttpError("Erreur lors de la récupération du circuit.", 500));
    }

    if (!circuits[0]) {
        return next(new HttpError("Circuit non trouvé.", 404));
    }

    let guides;
    try {
        guides = await query('SELECT * FROM guide WHERE id = ?', [Number(guide_id)]);
    } catch (error) {
        return next(new HttpError("Erreur lors de la récupération du guide.", 500));
    }

    if (!guides[0]) {
        return next(new HttpError("Guide non trouvé.", 404));
    }

    try {
        await query(
            'INSERT INTO circuit_guide (circuit_id, guide_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE guide_id = VALUES(guide_id)',
            [Number(id), Number(guide_id)]
        );
    } catch (error) {
        return next(new HttpError("Assignation du guide échouée.", 500));
    }

    res.json({ message: "Guide assigné avec succès.", guide: guides[0] });
};

const desassignerGuide = async (req, res, next) => {
    const { id } = req.params;

    try {
        await query('DELETE FROM circuit_guide WHERE circuit_id = ?', [Number(id)]);
    } catch (error) {
        return next(new HttpError("Désassignation du guide échouée.", 500));
    }

    res.json({ message: "Guide désassigné avec succès." });
};

(async () => {
    try {
        await Guide.insertMany([
            { nom: 'Jean', email: 'jean@test.com', experience: 5 },
            { nom: 'Marie', email: 'marie@test.com', experience: 3 }
        ]);
    } catch (err) {
        console.error("Erreur lors de l'insertion initiale des guides (MongoDB):", err);
    }
})();

module.exports = { getAllGuides, creerGuide, supprimerGuide, assignerGuide, desassignerGuide };
