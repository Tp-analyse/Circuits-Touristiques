const express = require('express');
const { body, check } = require('express-validator');
const circuitsController = require('../controllers/circuits-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', circuitsController.getAllCircuits);
router.get('/:id', circuitsController.getCircuitById);

router.use(checkAuth);

router.post('/', [
    check('nom').not().isEmpty(),
    check('nbjours').isInt({ min: 1 }),
    check('ville_depart').not().isEmpty(),
    check('ville_arrivee').not().isEmpty(),
    body('itineraire').isArray({ min: 1 }),
    body('itineraire.*').isInt({ min: 1 }),
], circuitsController.creerCircuit);

router.patch('/:id', [
    check('nom').not().isEmpty(),
    check('nbjours').isInt({ min: 1 }),
    check('ville_depart').not().isEmpty(),
    check('ville_arrivee').not().isEmpty(),
    body('itineraire').isArray({ min: 1 }),
    body('itineraire.*').isInt({ min: 1 }),
], circuitsController.modifierCircuit);

router.delete('/:id', circuitsController.supprimerCircuit);

module.exports = router;