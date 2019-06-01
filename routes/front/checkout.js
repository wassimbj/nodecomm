const express = require('express');
const router = express.Router();
const CheckoutController = require('../../controllers/front/CheckoutController');

// Main Route is "/user/checkout"

router.get('/', CheckoutController.middlware, CheckoutController.index.bind(CheckoutController));

router.get('/:id', CheckoutController.middlware, CheckoutController.transaction);

router.post('/', CheckoutController.middlware, CheckoutController.pay.bind(CheckoutController));

router.get('/success', (req, res) => {
    res.json('SUCCESS, PAY !!')
})

module.exports = router;