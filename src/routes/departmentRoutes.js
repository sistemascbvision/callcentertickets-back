// src/routes/departmentRoutes.js
const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const authMiddleware = require('../middlewares/auth');

router.get('/',  departmentController.getAllDepartments);
router.post('/',  departmentController.createDepartment);


module.exports = router;