// Visualization des données sur azure: https://serveur-b0cxhcg0c4bsgyez.scm.germanywestcentral-01.azurewebsites.net/phpmyadmin

const mysql = require('mysql');

function parseInAppConnStr(connStr) {
    const map = {};
    connStr.split(';').forEach(part => {
        const eq = part.indexOf('=');
        if (eq === -1) return;
        const key = part.slice(0, eq).trim();
        const val = part.slice(eq + 1).trim();
        map[key] = val;
    });
    const dataSource = map['Data Source'] || 'localhost';
    const [dsHost, dsPort] = dataSource.includes(':') ? dataSource.split(':') : [dataSource, null];
    return {
        host: dsHost,
        user: map['User Id'] || 'azure',
        password: map['Password'] || '',
        database: map['Database'] || map['Initial Catalog'] || 'localdb',
        port: dsPort ? Number(dsPort) : (Number(map['Port']) || Number(process.env.MYSQLPORT_localdb) || 3306),
    };
}

const inApp = process.env.MYSQLCONNSTR_localdb
    ? parseInAppConnStr(process.env.MYSQLCONNSTR_localdb)
    : null;

const pool = mysql.createPool({
    host: inApp ? inApp.host : (process.env.DB_HOST || 'localhost'),
    user: inApp ? inApp.user : (process.env.DB_USER || 'data'),
    password: inApp ? inApp.password : (process.env.DB_PASSWORD || '1234'),
    database: inApp ? inApp.database : (process.env.DB_NAME || 'gestionProduit'),
    port: inApp ? inApp.port : (Number(process.env.DB_PORT) || 3306),
    ssl: !inApp && process.env.DB_HOST && process.env.DB_HOST !== 'localhost'
        ? { rejectUnauthorized: false }
        : false,
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
            password VARCHAR(100) NOT NULL
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS monument (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nom VARCHAR(100) NOT NULL,
            date_construction DATE NOT NULL,
            resume_histoire TEXT NOT NULL,
            prix DECIMAL(10,2) NOT NULL
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS circuit (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nom VARCHAR(100) NOT NULL,
            nbjours INT NOT NULL,
            ville_depart VARCHAR(100) NOT NULL,
            ville_arrivee VARCHAR(100) NOT NULL,
            nb_etoiles INT NOT NULL DEFAULT 0
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

    await query(`
        CREATE TABLE IF NOT EXISTS guide (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nom VARCHAR(100) NOT NULL,
            prenom VARCHAR(100) NOT NULL
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS circuit_guide (
            circuit_id INT NOT NULL,
            guide_id INT NOT NULL,
            PRIMARY KEY (circuit_id),
            CONSTRAINT fk_circuit_guide_circuit
                FOREIGN KEY (circuit_id) REFERENCES circuit(id)
                ON DELETE CASCADE,
            CONSTRAINT fk_circuit_guide_guide
                FOREIGN KEY (guide_id) REFERENCES guide(id)
                ON DELETE CASCADE
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS client_circuit (
            client_id INT NOT NULL,
            circuit_id INT NOT NULL,
            PRIMARY KEY (client_id, circuit_id),
            CONSTRAINT fk_client_circuit_client FOREIGN KEY (client_id) REFERENCES client(clientId) ON DELETE CASCADE,
            CONSTRAINT fk_client_circuit_circuit FOREIGN KEY (circuit_id) REFERENCES circuit(id) ON DELETE CASCADE
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS inscription (
            id INT AUTO_INCREMENT PRIMARY KEY,
            client_id INT NOT NULL,
            circuit_id INT NOT NULL,
            date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES client(clientId) ON DELETE CASCADE,
            FOREIGN KEY (circuit_id) REFERENCES circuit(id) ON DELETE CASCADE
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS evaluation (
            id INT AUTO_INCREMENT PRIMARY KEY,
            circuit_id INT NOT NULL,
            client_id INT,
            note INT NOT NULL,
            commentaire TEXT NOT NULL,
            date_evaluation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT fk_evaluation_circuit
                FOREIGN KEY (circuit_id) REFERENCES circuit(id)
                ON DELETE CASCADE
        )
    `);

    try {
        await query(`ALTER TABLE evaluation ADD COLUMN client_id INT`);
    } catch (e) {
        // column already exists
    }

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
        const sql = 'INSERT INTO monument (nom, date_construction, resume_histoire, prix, nb_etoiles) VALUES (?, ?, ?, ?)';
        await query(sql, ['Tour Eiffel', '1889-05-06', "Monument emblématique de Paris construit par Gustave Eiffel pour l'Exposition Universelle.", 25.00]);
        await query(sql, ['Colisée', '0080-06-01', "Amphithéâtre romain pouvant accueillir jusqu'à 80 000 spectateurs.", 16.00]);
        await query(sql, ['Sagrada Família', '1882-03-19', "Basilique catholique conçue par Antoni Gaudí, toujours en construction.", 26.00]);
        await query(sql, ['Stonehenge', '03000-01-01', "Site préhistorique célèbre en Angleterre, constitué de pierres dressées.", 12.00]);
        await query(sql, ['Château de Versailles', '1682-05-06', "Palais royal français célèbre pour ses jardins et son architecture.", 30.00]);
        console.log('Monuments exemples insérés');
    }

    // Insert circuits if none exist
    const circuits = await query('SELECT COUNT(*) AS count FROM circuit');
    if (circuits[0].count === 0) {
        const sql = 'INSERT INTO circuit (nom, nbjours, ville_depart, ville_arrivee) VALUES (?, ?, ?, ?, ?)';
        await query(sql, ['Circuit Paris Historique', 3, 'Paris', 'Paris', 1]);
        await query(sql, ['Tour des Monuments Romains', 5, 'Rome', 'Rome', 3]);
        await query(sql, ['Découverte de la Catalogne', 4, 'Barcelone', 'Barcelone', 10]);
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
