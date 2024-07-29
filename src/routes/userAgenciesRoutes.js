const express = require('express');
const router = express.Router();
const userAgenciesController = require('../controllers/userAgenciesController');
const authMiddleware = require('../middlewares/auth');

router.get('/',  userAgenciesController.getAllUserAgencies);
router.get('/user/:userId',  userAgenciesController.getUserAgencies);
router.post('/user/:userId',  userAgenciesController.assignAgencyToUser);
router.delete('/user/:userId/:agencyId', userAgenciesController.removeAgencyFromUser);
router.get('/agency/:agencyId', authMiddleware, userAgenciesController.getUsersByAgency);

module.exports = router;