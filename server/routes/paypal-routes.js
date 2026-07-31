const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const paypalController = require('../controllers/paypal-controller');
const checkAuth = require('../middleware/check-auth');

router.post('/create-order', [
    check('amount').isFloat({ gt: 0 })
], paypalController.createOrder);
router.post('/capture-order/:orderId', checkAuth, [
    check('circuitId').optional().isInt({ min: 1 })
], paypalController.captureOrder);


module.exports = router;