// src/routes/agencyRoutes.js
const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyController');
const authMiddleware = require('../middlewares/auth');


router.get('/',  agencyController.getAllAgencies);
router.post('/', authMiddleware, agencyController.createAgency);
router.get('/:id', authMiddleware, agencyController.getAgencyById);
router.put('/:id', authMiddleware, agencyController.updateAgency);
router.delete('/:id', authMiddleware, agencyController.deleteAgency);

module.exports = router;