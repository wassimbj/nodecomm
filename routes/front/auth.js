const express = require('express');
const router = express.Router();
const UserController = require('../../controllers/front/UserController');

// prefixed route: /auth

router.get('/register', UserController.redirectIfAuth, UserController.register);

router.post('/register', UserController.redirectIfAuth, UserController.store);

router.get('/login', UserController.redirectIfAuth, UserController.login);

router.post('/login', UserController.redirectIfAuth, UserController.loginUser);

router.get('/logout', UserController.auth, UserController.logout)

router.get('/verify/:token', UserController.verify_email)

module.exports = router;