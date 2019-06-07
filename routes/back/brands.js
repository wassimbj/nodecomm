const express = require('express');
const router = express.Router();
const AdminBrandController = require('../../controllers/back/AdminBrandController');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: "nodeComm",
    allowedFormats: ["jpg", "png", 'svg', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: "limit" }]
});

const imgparser = multer({ storage: storage });
// cloudinary.v2.uploader.destroy(public_id, options, callback);
// Create categories and sub
router.get('/', AdminBrandController.index);
router.get('/create', AdminBrandController.create);

router.post('/create', imgparser.single('image'), AdminBrandController.store);

// // Delete
router.get('/delete/:id', AdminBrandController.delete)

// // edit
router.post('/edit', imgparser.single('new_image'), AdminBrandController.edit)

module.exports = router;