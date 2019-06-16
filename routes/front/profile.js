const express = require('express')
const router = express.Router();
const ProfileController = require('../../controllers/front/ProfileController');


router.get('/', ProfileController.index)

module.exports = router;