const Inscription = require("../models/inscription-model");

exports.inscrireCircuit = async (req, res, next) => {
    const { userId, circuitId } = req.body;

    try {
        await Inscription.create(userId, circuitId);
        res.status(201).json({ message: "Inscription réussie" });
    } catch (err) {
        next(err);
    }
};