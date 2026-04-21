const mysql = require('mysql');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'data',
    password: '1234',
    database: 'gestionProduit'
});

const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const initDB = async () => {

    await query(`
        CREATE TABLE IF NOT EXISTS client (
            clientId INT AUTO_INCREMENT PRIMARY KEY,
            numTelephone VARCHAR(20) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            nomPrenom VARCHAR(100) NOT NULL,
            dateNaissance DATE,
            password VARCHAR(100) NOT NULL
        )
    `);

    // Migration: add dateNaissance if table already existed without it
    try {
        await query(`ALTER TABLE client ADD COLUMN dateNaissance DATE`);
    } catch (e) {
        // Column already exists — ignore
    }

    await query(`
        CREATE TABLE IF NOT EXISTS monument (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nom VARCHAR(100) NOT NULL,
            date_construction DATE NOT NULL,
            resume_histoire TEXT NOT NULL,
            prix DECIMAL(10,2) NOT NULL,
            nb_etoiles INT NOT NULL DEFAULT 0
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS circuit (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nom VARCHAR(100) NOT NULL,
            nbjours INT NOT NULL,
            ville_depart VARCHAR(100) NOT NULL,
            ville_arrivee VARCHAR(100) NOT NULL
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS circuit_monument (
            circuit_id INT NOT NULL,
            monument_id INT NOT NULL,
            ordre INT NOT NULL,
            PRIMARY KEY (circuit_id, ordre),
            UNIQUE KEY unique_circuit_monument (circuit_id, monument_id),
            CONSTRAINT fk_circuit_monument_circuit
                FOREIGN KEY (circuit_id) REFERENCES circuit(id)
                ON DELETE CASCADE,
            CONSTRAINT fk_circuit_monument_monument
                FOREIGN KEY (monument_id) REFERENCES monument(id)
                ON DELETE RESTRICT
        )
    `);

    console.log('Tables MySQL initialisées');
};


const populateDatabase = async () => {
    // Insert clients if none exist
    const clients = await query('SELECT COUNT(*) AS count FROM client');
    if (clients[0].count === 0) {
        await query(`
            INSERT INTO client (numTelephone, email, nomPrenom, password) VALUES
            ('+1234567890', 'alice@example.com', 'Alice Tremblay', 'pass1234'),
            ('+1987654321', 'bob@example.com', 'Bob Martin', 'motdepasse'),
            ('+1122334455', 'carol@example.com', 'Carol Dupont', 'secret99')
        `);
        console.log('Clients exemples insérés');
    }

    // Insert monuments if none exist
    const monuments = await query('SELECT COUNT(*) AS count FROM monument');
    if (monuments[0].count === 0) {
        const sql = 'INSERT INTO monument (nom, date_construction, resume_histoire, prix, nb_etoiles) VALUES (?, ?, ?, ?, ?)';
        await query(sql, ['Tour Eiffel', '1889-05-06', "Monument emblématique de Paris construit par Gustave Eiffel pour l'Exposition Universelle.", 25.00, 5]);
        await query(sql, ['Colisée', '0080-06-01', "Amphithéâtre romain pouvant accueillir jusqu'à 80 000 spectateurs.", 16.00, 4]);
        await query(sql, ['Sagrada Família', '1882-03-19', "Basilique catholique conçue par Antoni Gaudí, toujours en construction.", 26.00, 5]);
        await query(sql, ['Stonehenge', '03000-01-01', "Site préhistorique célèbre en Angleterre, constitué de pierres dressées.", 12.00, 3]);
        await query(sql, ['Château de Versailles', '1682-05-06', "Palais royal français célèbre pour ses jardins et son architecture.", 30.00, 5]);
        console.log('Monuments exemples insérés');
    }

    // Insert circuits if none exist
    const circuits = await query('SELECT COUNT(*) AS count FROM circuit');
    if (circuits[0].count === 0) {
        const sql = 'INSERT INTO circuit (nom, nbjours, ville_depart, ville_arrivee) VALUES (?, ?, ?, ?)';
        await query(sql, ['Circuit Paris Historique', 3, 'Paris', 'Paris']);
        await query(sql, ['Tour des Monuments Romains', 5, 'Rome', 'Rome']);
        await query(sql, ['Découverte de la Catalogne', 4, 'Barcelone', 'Barcelone']);
        console.log('Circuits exemples insérés');
    }

    // Insert circuit_monument relations if none exist
    const circuitMonuments = await query('SELECT COUNT(*) AS count FROM circuit_monument');
    if (circuitMonuments[0].count === 0) {
        // Fetch monument IDs by name for reference
        const monumentsList = await query('SELECT id, nom FROM monument');
        const monumentMap = {};
        monumentsList.forEach(m => {
            monumentMap[m.nom] = m.id;
        });

        // Fetch circuit IDs by name for reference
        const circuitsList = await query('SELECT id, nom FROM circuit');
        const circuitMap = {};
        circuitsList.forEach(c => {
            circuitMap[c.nom] = c.id;
        });

        // Insert relations: circuit_id, monument_id, ordre
        // Circuit Paris Historique: Tour Eiffel (1), Château de Versailles (2)
        await query('INSERT INTO circuit_monument (circuit_id, monument_id, ordre) VALUES (?, ?, ?)', [circuitMap['Circuit Paris Historique'], monumentMap['Tour Eiffel'], 1]);
        await query('INSERT INTO circuit_monument (circuit_id, monument_id, ordre) VALUES (?, ?, ?)', [circuitMap['Circuit Paris Historique'], monumentMap['Château de Versailles'], 2]);

        // Tour des Monuments Romains: Colisée (1)
        await query('INSERT INTO circuit_monument (circuit_id, monument_id, ordre) VALUES (?, ?, ?)', [circuitMap['Tour des Monuments Romains'], monumentMap['Colisée'], 1]);

        // Découverte de la Catalogne: Sagrada Família (1)
        await query('INSERT INTO circuit_monument (circuit_id, monument_id, ordre) VALUES (?, ?, ?)', [circuitMap['Découverte de la Catalogne'], monumentMap['Sagrada Família'], 1]);

        console.log('Relations circuit_monument exemples insérées');
    }
};

module.exports = { query, initDB, populateDatabase };
