const express = require('express');
const { check } = require('express-validator');
const usersController = require('../controllers/users-controller');

const router = express.Router();

router.post('/connexion', [
    check('email').trim().isEmail(),
    check('password').isString().not().isEmpty()
], usersController.connexion);

router.post('/inscription', [
    check('nom').trim().not().isEmpty().isLength({ max: 49 }),
    check('prenom').trim().not().isEmpty().isLength({ max: 50 }),
    check('email').trim().isEmail().isLength({ max: 100 }),
    check('password').isString().isLength({ min: 8, max: 72 }),
    check('telephone').trim().not().isEmpty().isLength({ max: 20 })
], usersController.inscription);

module.exports = router;