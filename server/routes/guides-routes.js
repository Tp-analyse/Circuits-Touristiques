const express = require('express');
const { check } = require('express-validator');
const guidesController = require('../controllers/guides-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', guidesController.getAllGuides);

router.use(checkAuth);

router.post('/', [
    check('nom').not().isEmpty(),
    check('prenom').not().isEmpty(),
], guidesController.creerGuide);

router.delete('/:id', guidesController.supprimerGuide);

module.exports = router;
