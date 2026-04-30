const db = require("../util/bd");

class Inscription {
    static create(userId, circuitId) {
        return db.execute(
            "INSERT INTO inscription (user_id, circuit_id) VALUES (?, ?)",
            [userId, circuitId]
        );
    }

    static getByUser(userId) {
        return db.execute(
            "SELECT * FROM inscription WHERE user_id = ?",
            [userId]
        );
    }

    static getByCircuit(circuitId) {
        return db.execute(
            "SELECT * FROM inscription WHERE circuit_id = ?",
            [circuitId]
        );
    }
}

module.exports = Inscription;