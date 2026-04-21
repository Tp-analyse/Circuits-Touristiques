const { validationResult } = require('express-validator');
const { query } = require('../util/bd');
const HttpError = require('../util/http-error');

const getAllCircuits = async (req, res, next) => {
	let circuits;

	try {
		circuits = await query('SELECT * FROM circuit');
	} catch (error) {
		return next(new HttpError("Erreur lors de la récupération des circuits.", 500));
	}

	if (circuits.length === 0) {
		res.json({ circuits: [] });
		return;
	}

	let circuitMonuments;

	try {
		circuitMonuments = await query(
			`SELECT circuit_monument.circuit_id, circuit_monument.ordre, monument.id, monument.nom, monument.prix
             FROM circuit_monument
             INNER JOIN monument ON monument.id = circuit_monument.monument_id
             WHERE circuit_monument.circuit_id IN (?)
             ORDER BY circuit_monument.circuit_id ASC, circuit_monument.ordre ASC`,
			[circuits.map((circuit) => circuit.id)]
		);
	} catch (error) {
		return next(new HttpError("Erreur lors de la récupération de l'itinéraire des circuits.", 500));
	}

	const monumentsByCircuitId = new Map();

	circuitMonuments.forEach((monument) => {
		const currentMonuments = monumentsByCircuitId.get(monument.circuit_id) || [];

		currentMonuments.push({
			id: monument.id,
			nom: monument.nom,
			prix: Number(monument.prix),
			ordre: monument.ordre,
		});

		monumentsByCircuitId.set(monument.circuit_id, currentMonuments);
	});

	res.json({
		circuits: circuits.map((circuit) => {
			const itineraire = monumentsByCircuitId.get(circuit.id) || [];
			const total_prix = itineraire.reduce(
				(total, monument) => total + Number(monument.prix || 0),
				0
			);

			return {
				...circuit,
				itineraire,
				total_prix,
			};
		}),
	});
};

const getCircuitById = async (req, res, next) => {
	const { id } = req.params;

	let circuits;
	try {
		circuits = await query('SELECT * FROM circuit WHERE id = ?', [id]);
	} catch (error) {
		return next(new HttpError("Erreur lors de la récupération du circuit.", 500));
	}

	if (!circuits[0]) {
		return next(new HttpError("Circuit non trouvé.", 404));
	}

	let itineraire;
	try {
		itineraire = await query(
			`SELECT monument.id, monument.nom, circuit_monument.ordre
             FROM circuit_monument
             INNER JOIN monument ON monument.id = circuit_monument.monument_id
             WHERE circuit_monument.circuit_id = ?
             ORDER BY circuit_monument.ordre ASC`,
			[id]
		);
	} catch (error) {
		return next(new HttpError("Erreur lors de la récupération de l'itinéraire.", 500));
	}

	res.json({
		circuit: {
			...circuits[0],
			itineraire,
		},
	});
};

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

const modifierCircuit = async (req, res, next) => {
	const validationErrors = validationResult(req);
	if (!validationErrors.isEmpty()) {
		return next(new HttpError("Données saisies invalides.", 422));
	}

	const { id } = req.params;
	const { nom, nbjours, ville_depart, ville_arrivee, itineraire } = req.body;

	if (!Array.isArray(itineraire) || itineraire.length === 0) {
		return next(new HttpError("L'itinéraire doit contenir au moins un monument.", 422));
	}

	const monumentIds = itineraire.map((monumentId) => Number(monumentId));
	const hasInvalidMonumentId = monumentIds.some(
		(monumentId) => !Number.isInteger(monumentId) || monumentId <= 0
	);

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

	let circuits;
	try {
		circuits = await query('SELECT * FROM circuit WHERE id = ?', [id]);
	} catch (error) {
		return next(new HttpError("Erreur lors de la récupération du circuit.", 500));
	}

	if (!circuits[0]) {
		return next(new HttpError("Circuit non trouvé.", 404));
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
		await query(
			'UPDATE circuit SET nom = ?, nbjours = ?, ville_depart = ?, ville_arrivee = ? WHERE id = ?',
			[nom, nbjours, ville_depart, ville_arrivee, id]
		);

		await query('DELETE FROM circuit_monument WHERE circuit_id = ?', [id]);

		for (let index = 0; index < monumentIds.length; index++) {
			await query(
				'INSERT INTO circuit_monument (circuit_id, monument_id, ordre) VALUES (?, ?, ?)',
				[id, monumentIds[index], index + 1]
			);
		}
	} catch (error) {
		return next(new HttpError("Mise à jour du circuit échouée.", 500));
	}

	res.json({
		circuit: {
			id: Number(id),
			nom,
			nbjours,
			ville_depart,
			ville_arrivee,
			itineraire: monumentIds,
		},
	});
};

const supprimerCircuit = async (req, res, next) => {
	const { id } = req.params;

	let circuits;
	try {
		circuits = await query('SELECT * FROM circuit WHERE id = ?', [id]);
	} catch (error) {
		return next(new HttpError("Erreur lors de la récupération du circuit.", 500));
	}

	if (!circuits[0]) {
		return next(new HttpError("Circuit non trouvé.", 404));
	}

	try {
		await query('DELETE FROM circuit WHERE id = ?', [id]);
	} catch (error) {
		return next(new HttpError("Suppression du circuit échouée.", 500));
	}

	res.json({ message: "Circuit supprimé avec succès." });
};

module.exports = {
	getAllCircuits,
	getCircuitById,
	creerCircuit,
	modifierCircuit,
	supprimerCircuit,
};