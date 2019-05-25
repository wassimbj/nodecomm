const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const ShippingController = require('../controllers/ShippingController');

router.get('/', UserController.auth, ShippingController.index)

router.post('/', UserController.auth, ShippingController.store)

module.exports = router;