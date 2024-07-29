//esto ya estaba 
// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

router.post('/', UserController.register);
router.post('/login', UserController.login);
router.get('/', UserController.getAllUsers);
router.get('/:userId', UserController.getUserById); 
router.put('/:userId', UserController.updateUser); 
router.delete('/:userId', UserController.deleteUser); 
router.get('/current', UserController.getCurrentUser); 

module.exports = router;



