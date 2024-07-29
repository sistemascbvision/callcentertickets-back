const express = require('express');
const router = express.Router();
const userDepartmentController = require('../controllers/userDepartmentController');
const authMiddleware = require('../middlewares/auth');

router.post('/',  userDepartmentController.assignDepartmentToUser);
router.get('/user/:userId', userDepartmentController.getDepartmentsForUser);
router.get('/', userDepartmentController.getAllUserDepartments);
router.put('/',  userDepartmentController.updateUserDepartment);
router.delete('/:userId/:departmentId', userDepartmentController.deleteUserDepartment);
router.get('/department/:departmentId',  userDepartmentController.getUsersByDepartment);

module.exports = router;