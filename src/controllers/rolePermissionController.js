const { getMainDb } = require('../config/database');

exports.assignPermissionToRole = async (req, res) => {
  let connection;
  try {
    const { roleId, permissionId } = req.body;
    connection = await getMainDb();
    await connection.query('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [roleId, permissionId]);
    res.status(201).json({ message: 'Permission assigned to role successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning permission to role', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.getPermissionsForRole = async (req, res) => {
  let connection;
  try {
    const { roleId } = req.params;
    connection = await getMainDb();
    const [rows] = await connection.query(
      'SELECT p.* FROM permissions p JOIN role_permissions rp ON p.id = rp.permission_id WHERE rp.role_id = ?',
      [roleId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving permissions for role', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.getAllRolePermissions = async (req, res) => {
  let connection;
  try {
    connection = await getMainDb();
    const [rows] = await connection.query('SELECT * FROM role_permissions JOIN permissions ON role_permissions.permission_id = permissions.id');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving role permissions', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

