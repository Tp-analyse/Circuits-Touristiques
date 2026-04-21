const express = require('express');
const { check } = require('express-validator');
const usersController = require('../controllers/users-controller');

const router = express.Router();

router.post('/connexion', [
    check('email').not().isEmpty(),
    check('password').not().isEmpty()
], usersController.connexion);

router.post('/inscription', [
    check('nom').not().isEmpty(),
    check('prenom').not().isEmpty(),
    check('email').isEmail(),
    check('password').not().isEmpty(),
    check('telephone').not().isEmpty()
], usersController.inscription);

module.exports = router;
