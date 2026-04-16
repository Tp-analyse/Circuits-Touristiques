const PORT = 3000;
const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');


app.use(cors());
app.use(bodyParser.json());

app.get('/', function (request, response) {
    response.send('Bonjour!');
});
app.listen(PORT, () => {
    console.log(`Web client is running on port ${PORT}`);
});



function createClientTable() {
    return new Promise((resolve, reject) => {
        let con = mysql.createConnection({
            host: "localhost",
            user: "data",
            password: "1234",
            database: "gestionProduit"
        });

        con.connect(function (err) {
            if (err) {
                reject("Database connection error: " + err);
                return;
            }

            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS client (
                    clientId INT AUTO_INCREMENT PRIMARY KEY,
                    numTelephone VARCHAR(20) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    nomPrenom VARCHAR(100) NOT NULL,
                    password VARCHAR(12) NOT NULL
                )
            `;

            con.query(createTableQuery, function (err, result) {
                con.end();
                if (err) {
                    reject("Error creating table: " + err);
                    return;
                }
                resolve("Table 'client' created successfully");
            });
        });
    });
}

function ajouterExempleClients() {
    return new Promise((resolve, reject) => {
        let con = mysql.createConnection({
            host: "localhost",
            user: "data",
            password: "1234",
            database: "gestionProduit"
        });

        con.connect(function (err) {
            if (err) {
                reject("Database connection error: " + err);
                return;
            }

            const insertQuery = `
                INSERT INTO client (numTelephone, email, nomPrenom, password) VALUES
                ('+1234567890', 'john.doe@example.com', 'John Doe', 'NOn'),
                ('+1987654321', 'jane.smith@example.com', 'Jane Smith', 'Oui'),
                ('+1122334455', 'alice.jones@example.com', 'Alice Jones', 'password'),
                ('+1098765432', 'bob.brown@example.com', 'Bob Brown', '25671'),
                ('+1012345678', 'carol.white@example.com', 'Carol White', '1234')
            `;

            con.query(insertQuery, function (err, result) {
                con.end();
                if (err) {
                    reject("Error inserting dummy data: " + err);
                    return;
                }
                resolve("Dummy data inserted successfully");
            });
        });
    });
}


createClientTable()
    .then(message => {
        console.log(message);
        return ajouterExempleClients();
    })
    .then(insertMessage => {
        console.log(insertMessage);
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error(error);
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} (table creation or data insertion failed)`);
        });
    });
