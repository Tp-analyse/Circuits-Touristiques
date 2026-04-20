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
    await query('DROP TABLE IF EXISTS circuit_monument');
    await query('DROP TABLE IF EXISTS circuit');
    await query('DROP TABLE IF EXISTS monument');
    await query('DROP TABLE IF EXISTS client');

    await query(`
        CREATE TABLE client (
            clientId INT AUTO_INCREMENT PRIMARY KEY,
            numTelephone VARCHAR(20) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            nomPrenom VARCHAR(100) NOT NULL,
            password VARCHAR(100) NOT NULL
        )
    `);

    await query(`
        CREATE TABLE monument (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nom VARCHAR(100) NOT NULL,
            date_construction DATE NOT NULL,
            resume_histoire TEXT NOT NULL,
            prix DECIMAL(10,2) NOT NULL,
            nb_etoiles INT NOT NULL DEFAULT 0
        )
    `);

    await query(`
        CREATE TABLE circuit (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nom VARCHAR(100) NOT NULL,
            nbjours INT NOT NULL,
            ville_depart VARCHAR(100) NOT NULL,
            ville_arrivee VARCHAR(100) NOT NULL
        )
    `);

    await query(`
        CREATE TABLE circuit_monument (
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

    const monuments = await query('SELECT COUNT(*) AS count FROM monument');
    if (monuments[0].count === 0) {
        const sql = 'INSERT INTO monument (nom, date_construction, resume_histoire, prix) VALUES (?, ?, ?, ?)';
        await query(sql, ['Tour Eiffel', '1889-05-06', "Monument emblématique de Paris construit par Gustave Eiffel pour l'Exposition Universelle.", 25.00]);
        await query(sql, ['Colisée', '0080-06-01', "Amphithéâtre romain pouvant accueillir jusqu'à 80 000 spectateurs.", 16.00]);
        await query(sql, ['Sagrada Família', '1882-03-19', "Basilique catholique conçue par Antoni Gaudí, toujours en construction.", 26.00]);
        console.log('Monuments exemples insérés');
    }
};

module.exports = { query, initDB, populateDatabase };
