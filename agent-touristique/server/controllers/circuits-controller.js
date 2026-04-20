const { validationResult } = require('express-validator');
const { query } = require('../util/bd');
const HttpError = require('../util/http-error');

const creerCircuit = async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return next(new HttpError("Données saisies invalides.", 422));
    }

    const { nom, nbjours, ville_depart, ville_arrivee, itineraire } = req.body;

    if (!Array.isArray(itineraire) || itineraire.length === 0) {
        return next(new HttpError("L'itinéraire doit contenir au moins un monument.", 422));
    }

    const monumentIds = itineraire.map((id) => Number(id));
    const hasInvalidMonumentId = monumentIds.some((id) => !Number.isInteger(id) || id <= 0);
    if (hasInvalidMonumentId) {
        return next(new HttpError("L'itinéraire contient des identifiants de monuments invalides.", 422));
    }

    const seenIds = [];
    let hasDuplicateMonument = false;

    for (let index = 0; index < monumentIds.length; index++) {
        if (seenIds.includes(monumentIds[index])) {
            hasDuplicateMonument = true;
            break;
        }

        seenIds.push(monumentIds[index]);
    }

    if (hasDuplicateMonument) {
        return next(new HttpError("Un monument ne peut pas être ajouté deux fois dans le même circuit.", 422));
    }

    let monuments;
    try {
        monuments = await query('SELECT id FROM monument WHERE id IN (?)', [monumentIds]);
    } catch (error) {
        return next(new HttpError("Erreur lors de la validation des monuments.", 500));
    }

    if (monuments.length !== monumentIds.length) {
        return next(new HttpError("Un ou plusieurs monuments de l'itinéraire sont introuvables.", 404));
    }

    try {
        const circuitResult = await query(
            'INSERT INTO circuit (nom, nbjours, ville_depart, ville_arrivee) VALUES (?, ?, ?, ?)',
            [nom, nbjours, ville_depart, ville_arrivee]
        );

        const circuitId = circuitResult.insertId;

        try {
            for (let index = 0; index < monumentIds.length; index++) {
                await query(
                    'INSERT INTO circuit_monument (circuit_id, monument_id, ordre) VALUES (?, ?, ?)',
                    [circuitId, monumentIds[index], index + 1]
                );
            }
        } catch (error) {
            await query('DELETE FROM circuit WHERE id = ?', [circuitId]);
            throw error;
        }

        res.status(201).json({
            circuit: {
                id: circuitId,
                nom,
                nbjours,
                ville_depart,
                ville_arrivee,
                itineraire: monumentIds,
            },
        });
    } catch (error) {
        return next(new HttpError("Création du circuit échouée.", 500));
    }
};

module.exports = { creerCircuit };
