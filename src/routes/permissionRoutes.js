// src/routes/permissionRoutes.js
const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, permissionController.getAllPermissions);
router.post('/', authMiddleware, permissionController.createPermission);


module.exports = router;