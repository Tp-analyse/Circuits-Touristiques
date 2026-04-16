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

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error(error);
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} (table creation failed)`);
        });
    });