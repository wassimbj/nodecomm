const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const CartController = require('../controllers/CartController');

router.get('/cart', UserController.auth, CartController.index);

router.post('/cart/add', UserController.auth, CartController.addToCart);

router.post('/cart/update', UserController.auth, CartController.updateCart)

router.get('/cart/:id/delete', UserController.auth, CartController.delete);

module.exports = router;