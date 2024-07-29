// src/controllers/userRoleController.js
const { getMainDb } = require('../config/database');

exports.assignRoleToUser = async (req, res) => {
  let connection;
  try {
    const { userId, roleId } = req.body;
    connection = await getMainDb();
    await connection.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, roleId]);
    res.status(201).json({ message: 'Role assigned to user successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning role to user', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.getRolesForUser = async (req, res) => {
  let connection;
  try {
    const { userId } = req.params;
    connection = await getMainDb();
    const [rows] = await connection.query(
      'SELECT r.* FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?',
      // 'SELECT ur.user_id as id_usuario, u.username as usuario,  ur.role_id as rol_id, r.name rol FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id LIMIT 25',

      [userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving roles for user', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.getAllUserRoles = async (req, res) => {
  let connection;
  try {
    connection = await getMainDb();
    const [rows] = await connection.query('SELECT ur.user_id as id_usuario, u.username as usuario,  ur.role_id as rol_id, r.name rol FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user roles', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.updateUserRole = async (req, res) => {
  let connection;
  try {
    const { userId, oldRoleId, newRoleId } = req.body;
    connection = await getMainDb();
    await connection.query('UPDATE user_roles SET role_id = ? WHERE user_id = ? AND role_id = ?', [newRoleId, userId, oldRoleId]);
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.deleteUserRole = async (req, res) => {
  let connection;
  try {
    const { userId, roleId } = req.params;
    connection = await getMainDb();
    await connection.query('DELETE FROM user_roles WHERE user_id = ? AND role_id = ?', [userId, roleId]);
    res.json({ message: 'User role deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user role', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.getUsersByRole = async (req, res) => {
  let connection;
  try {
    const { roleId } = req.params;
    connection = await getMainDb();
    const [rows] = await connection.query(
      'SELECT u.* FROM users u JOIN user_roles ur ON u.id = ur.user_id WHERE ur.role_id = ?',
      [roleId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users by role', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};