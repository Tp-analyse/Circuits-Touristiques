const express = require('express');
const router = express.Router();
const paypalController = require('../controllers/paypal-controller');
const checkAuth = require('../middleware/check-auth');

router.post('/create-order', paypalController.createOrder);
router.post('/capture-order/:orderId', checkAuth, paypalController.captureOrder);


module.exports = router;
