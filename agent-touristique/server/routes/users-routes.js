const express = require('express');
const { check } = require('express-validator');
const usersController = require('../controllers/users-controller');

const router = express.Router();

router.post('/connexion', [
    check('email').not().isEmpty(),
    check('password').not().isEmpty()
], usersController.connexion);

module.exports = router;
