const express = require('express');
const router = express.Router();
const CheckoutController = require('../controllers/CheckoutController');

router.get('/', CheckoutController.middlware, CheckoutController.index.bind(CheckoutController));

router.get('/:id', CheckoutController.middlware, CheckoutController.transaction);

router.post('/', CheckoutController.middlware, CheckoutController.pay.bind(CheckoutController));

module.exports = router;