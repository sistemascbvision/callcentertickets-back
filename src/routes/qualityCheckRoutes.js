// src/routes/qualityCheckRoutes.js
const express = require('express');
const router = express.Router();
const qualityCheckController = require('../controllers/qualityCheckController');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, qualityCheckController.getAllQualityChecks);
router.post('/', authMiddleware, qualityCheckController.createQualityCheck);


module.exports = router;