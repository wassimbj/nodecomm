const express = require('express');
const router = express.Router();
const AdminProductsController = require('../../controllers/back/AdminProductsController');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary config
cloudinary.config({
    cloud_name: 'wassimbj',
    api_key: '984761639488781',
    api_secret: 'pzOuyNMKKwZEh14s0ahCYoWLPDc'
});

const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: "nodeComm",
    allowedFormats: ["jpg", "png", 'svg', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: "limit" }]
});

const imgparser = multer({ storage: storage });

// Create products
router.get('/create', AdminProductsController.create);
router.post('/create', imgparser.array('img', 5), AdminProductsController.store);

// edit products

// delete products

module.exports = router;