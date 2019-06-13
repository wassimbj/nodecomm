const express = require('express');
const router = express.Router();
const CheckoutController = require('../../controllers/front/CheckoutController');

// Main Route is "/user/checkout"

router.get('/', CheckoutController.middlware, CheckoutController.index.bind(CheckoutController));

// router.get('/:id', CheckoutController.middlware, CheckoutController.transaction.bind(CheckoutController));

router.post('/', CheckoutController.pay.bind(CheckoutController));

router.get('/success', CheckoutController.confirmation)

module.exports = router;