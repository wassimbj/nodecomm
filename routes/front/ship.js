const express = require('express');
const router = express.Router();
const UserController = require('../../controllers/front/UserController');
const ShippingController = require('../../controllers/front/ShippingController');

router.get('/', UserController.auth, ShippingController.index)

router.post('/', UserController.auth, ShippingController.store)

module.exports = router;