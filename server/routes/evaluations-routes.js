const express = require('express');
const evaluationsController = require('../controllers/evaluations-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', evaluationsController.getEvaluations);
router.post('/', checkAuth, evaluationsController.creerEvaluation);
router.delete('/:id', evaluationsController.supprimerEvaluation);

module.exports = router;
