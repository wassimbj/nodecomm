const express = require('express')
const router = express.Router();
const UserController = require('../../controllers/front/UserController');
const ProfileController = require('../../controllers/front/ProfileController');
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
// prefixed route: /user/profile

router.get('/', UserController.auth, ProfileController.index)
router.get('/edit', UserController.auth, ProfileController.edit)

router.post('/edit', UserController.auth, imgparser.single('new_img'), ProfileController.update)

module.exports = router;