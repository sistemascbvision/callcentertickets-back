// src/routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, roleController.getAllRoles);
router.post('/', authMiddleware, roleController.createRole);


module.exports = router;