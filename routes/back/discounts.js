const express = require('express');
const router = express.Router();
const AdminDiscountsController = require('../../controllers/back/AdminDiscountsController')

router.get('/', AdminDiscountsController.index);

// Create
router.get('/create', AdminDiscountsController.create);
router.post('/create', AdminDiscountsController.store);

// Edit & Delete
router.get('/:id/edit', AdminDiscountsController.edit);
router.get('/:id/delete', AdminDiscountsController.delete);

router.post('/update', AdminDiscountsController.update)



module.exports = router;