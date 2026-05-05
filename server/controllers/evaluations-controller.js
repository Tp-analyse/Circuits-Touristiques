const { query } = require('../util/bd');
const HttpError = require('../util/http-error');

const getEvaluations = async (req, res, next) => {
    let evaluations;

    try {
        evaluations = await query('SELECT * FROM evaluation ORDER BY date_evaluation DESC');
    } catch (error) {
        return next(new HttpError("Erreur lors de la récupération des évaluations.", 500));
    }

    res.json({ evaluations });
};

const creerEvaluation = async (req, res, next) => {
    const { circuitId, note, commentaire } = req.body;
    const clientId = req.userData.userId;

    if (!circuitId || note === undefined || !commentaire) {
        return next(new HttpError("Tous les champs sont obligatoires.", 422));
    }

    const noteNumber = Number(note);
    if (noteNumber < 0 || noteNumber > 10) {
        return next(new HttpError("La note doit être entre 0 et 10.", 422));
    }

    let circuits;
    try {
        circuits = await query(
            'SELECT circuit_id FROM client_circuit WHERE client_id = ? AND circuit_id = ?',
            [clientId, circuitId]
        );
    } catch (error) {
        return next(new HttpError("Erreur lors de la vérification de l'inscription.", 500));
    }

    if (circuits.length === 0) {
        return next(new HttpError("Vous n'êtes pas inscrit à ce circuit.", 403));
    }

    try {
        const result = await query(
            'INSERT INTO evaluation (circuit_id, client_id, note, commentaire) VALUES (?, ?, ?, ?)',
            [circuitId, clientId, noteNumber, commentaire]
        );
        res.status(201).json({ message: "Évaluation envoyée avec succès.", id: result.insertId });
    } catch (error) {
        return next(new HttpError("Erreur lors de l'enregistrement de l'évaluation.", 500));
    }
};

const supprimerEvaluation = async (req, res, next) => {
    const { id } = req.params;

    try {
        const result = await query('DELETE FROM evaluation WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return next(new HttpError("Évaluation non trouvée.", 404));
        }
        res.json({ message: "Évaluation supprimée avec succès." });
    } catch (error) {
        return next(new HttpError("Erreur lors de la suppression.", 500));
    }
};

module.exports = { getEvaluations, creerEvaluation, supprimerEvaluation };
