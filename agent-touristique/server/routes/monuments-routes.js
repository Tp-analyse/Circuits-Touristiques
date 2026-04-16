const express = require('express');
const { check } = require('express-validator');
const monumentsController = require('../controllers/monuments-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', monumentsController.getAllMonuments);
router.get('/:id', monumentsController.getMonumentById);

router.use(checkAuth);

router.post('/', [
    check('nom').not().isEmpty(),
    check('date_construction').not().isEmpty(),
    check('resume_histoire').not().isEmpty(),
    check('prix').isFloat({ min: 0 })
], monumentsController.creerMonument);

router.patch('/:id', [
    check('nom').not().isEmpty(),
    check('date_construction').not().isEmpty(),
    check('resume_histoire').not().isEmpty(),
    check('prix').isFloat({ min: 0 }),
    check('nb_etoiles').isInt({ min: 1, max: 5 })
], monumentsController.modifierMonument);

router.delete('/:id', monumentsController.supprimerMonument);

module.exports = router;
