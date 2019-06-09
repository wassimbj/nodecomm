const express = require('express');
const router = express.Router();
const AdminCateController = require('../../controllers/back/AdminCateController');

// Main route: /admin/category

// Create categories and sub
router.get('/', AdminCateController.index);
router.get('/create', AdminCateController.create);

router.post('/create', AdminCateController.store);

// Delete
router.get('/delete/:type/:id', AdminCateController.delete)

// edit
router.post('/edit/:type', AdminCateController.edit)

// Get sub categories from parent with AJAX call
router.post('/sub', AdminCateController.getSubcate)

module.exports = router;