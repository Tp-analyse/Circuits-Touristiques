const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', function (request, response) {
	response.send('Bonjour!');
});
app.listen(port)



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
                    nomPrenom VARCHAR(100) NOT NULL
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

createClientTable()
    .then(message => {
        console.log(message);

        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch(error => {
        console.error(error);
        app.listen(port, () => {
            console.log(`Server running on port ${port} (table creation failed)`);
        });
    });