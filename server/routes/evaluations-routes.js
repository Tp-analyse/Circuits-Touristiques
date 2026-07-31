const express = require('express');
const { check } = require('express-validator');
const evaluationsController = require('../controllers/evaluations-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', evaluationsController.getEvaluations);
router.post('/', checkAuth, [
    check('circuitId').isInt({ min: 1 }),
    check('note').isInt({ min: 0, max: 10 }),
    check('commentaire').trim().not().isEmpty()
], evaluationsController.creerEvaluation);
router.delete('/:id', evaluationsController.supprimerEvaluation);

module.exports = router;