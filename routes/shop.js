const express = require('express');
const router = express.Router();
const ShopController = require('../controllers/ShopController');

router.get('/', ShopController.index.bind(ShopController));

router.post('/', ShopController.filter.bind(ShopController));

router.post('/page', ShopController.page.bind(ShopController));

module.exports = router;
