const express = require('express');
const router = express.Router();
const rolePermissionController = require('../controllers/rolePermissionController');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, rolePermissionController.getAllRolePermissions);
router.post('/:roleId', authMiddleware, rolePermissionController.assignPermissionToRole);
router.get('/:roleId', authMiddleware, rolePermissionController.getPermissionsForRole);


module.exports = router;