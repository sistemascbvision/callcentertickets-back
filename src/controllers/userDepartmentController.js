// src/controllers/userDepartmentController.js
const { getMainDb } = require('../config/database');

exports.assignDepartmentToUser = async (req, res) => {
  let connection;
  try {
    const { userId, departmentId } = req.body;
    connection = await getMainDb();
    await connection.query('INSERT INTO user_departments (user_id, department_id) VALUES (?, ?)', [userId, departmentId]);
    res.status(201).json({ message: 'Department assigned to user successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning department to user', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.getDepartmentsForUser = async (req, res) => {
  let connection;
  try {
    const { userId } = req.params;
    connection = await getMainDb();
    const [rows] = await connection.query(
      'SELECT d.* FROM departments d JOIN user_departments ud ON d.id = ud.department_id WHERE ud.user_id = ?',
      [userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving departments for user', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.getAllUserDepartments = async (req, res) => {
  let connection;
  try {
    connection = await getMainDb();
    const [rows] = await connection.query('SELECT ud.user_id, u.username, ud.department_id, d.name as department_name FROM users u JOIN user_departments ud ON u.id = ud.user_id JOIN departments d ON ud.department_id = d.id');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user departments', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.updateUserDepartment = async (req, res) => {
  let connection;
  try {
    const { userId, oldDepartmentId, newDepartmentId } = req.body;
    connection = await getMainDb();
    await connection.query('UPDATE user_departments SET department_id = ? WHERE user_id = ? AND department_id = ?', [newDepartmentId, userId, oldDepartmentId]);
    res.json({ message: 'User department updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user department', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.deleteUserDepartment = async (req, res) => {
  let connection;
  try {
    const { userId, departmentId } = req.params;
    connection = await getMainDb();
    await connection.query('DELETE FROM user_departments WHERE user_id = ? AND department_id = ?', [userId, departmentId]);
    res.json({ message: 'User department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user department', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.getUsersByDepartment = async (req, res) => {
  let connection;
  try {
    const { departmentId } = req.params;
    connection = await getMainDb();
    const [rows] = await connection.query(
      'SELECT u.* FROM users u JOIN user_departments ud ON u.id = ud.user_id WHERE ud.department_id = ?',
      [departmentId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users by department', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};