const express = require('express');
const cors = require('cors');

const { initDB, populateDatabase } = require('./util/bd');
const errorHandler = require('./handler/error-handler');
const usersRoutes = require('./routes/users-routes');
const monumentsRoutes = require('./routes/monuments-routes');
const circuitsRoutes = require('./routes/circuits-routes');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/users', usersRoutes);
app.use('/api/monuments', monumentsRoutes);
app.use('/api/circuits', circuitsRoutes);

app.use((req, res, next) => {
    const error = new Error('Route non trouvée');
    error.statusCode = 404;
    next(error);
});

app.use(errorHandler);

const port = process.env.PORT || 3000;

initDB()
    .then(() => populateDatabase())
    .then(() => {
        app.listen(port, () => {
            console.log(`Serveur écoute au: http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error('Erreur initialisation DB:', err);
    });
