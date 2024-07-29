const express = require('express');
const router = express.Router();
const userRoleController = require('../controllers/userRoleController');
const authMiddleware = require('../middlewares/auth');

router.post('/',  userRoleController.assignRoleToUser);
router.get('/user/:userId', userRoleController.getRolesForUser);
router.get('/', authMiddleware, userRoleController.getAllUserRoles);
router.put('/', authMiddleware, userRoleController.updateUserRole);
router.delete('/:userId/:roleId', userRoleController.deleteUserRole);
router.get('/role/:roleId', authMiddleware, userRoleController.getUsersByRole);

module.exports = router;



