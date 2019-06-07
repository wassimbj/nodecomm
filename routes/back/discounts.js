const express = require('express');
const router = express.Router();
const AdminDiscountsController = require('../../controllers/back/AdminDiscountsController')

router.get('/create', AdminDiscountsController.create);
router.post('/create', AdminDiscountsController.store);


module.exports = router;