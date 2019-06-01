const express = require('express');
const router = express.Router();
const UserController = require('../../controllers/front/UserController');
const CartController = require('../../controllers/front/CartController');

router.get('/cart', UserController.auth, CartController.index);

router.post('/cart/add', UserController.auth, CartController.addToCart);

router.post('/cart/update', UserController.auth, CartController.updateCart)

router.get('/cart/:id/delete', UserController.auth, CartController.delete);

module.exports = router;