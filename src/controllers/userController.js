
const { getMainDb } = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registro de usuarios
exports.register = async (req, res) => {
  let connection;
  try {
    const { username, email, password, phone_number, first_name, last_name } = req.body;
    connection = await getMainDb();

    // Verificamos si el usuario ya existe
    const [existingUser] = await connection.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'El usuario o email ya está en uso' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el nuevo usuario
    const [result] = await connection.query(
      'INSERT INTO users (username, email, password, phone_number, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, phone_number, first_name, last_name]
    );

    res.status(201).json({ message: 'Usuario registrado exitosamente', userId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// Login de usuario
exports.login = async (req, res) => {
  let connection;
  try {
    const { username, password } = req.body;
    connection = await getMainDb();

    // Buscamos al usuario
    const [users] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Autenticación fallida' });
    }

    const user = users[0];

    // Verificamos la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Autenticación fallida' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '72h' }
    );

    const [roles] = await connection.query(
      'SELECT r.id AS role_id, r.name AS role_name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?',
      [user.id]
    );

    let agencyId = null;
    const [agency] = await connection.query('SELECT agency_id FROM user_agencies WHERE user_id = ?', [user.id]);
    if (agency.length > 0) {
      agencyId = agency[0].agency_id;
    }

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: roles.map(role => ({
          id: role.role_id,
          name: role.role_name
        })),
        agency_id: agencyId 
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.getAllUsers = async (req, res) => {
  let connection;
  try {
    connection = await getMainDb();
    const [users] = await connection.query(
      `SELECT 
    u.id,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    u.phone_number, 
    u.is_active,
    GROUP_CONCAT(DISTINCT r.id ORDER BY r.id SEPARATOR ', ') AS role_id,
    GROUP_CONCAT(DISTINCT r.name ORDER BY r.id SEPARATOR ', ') AS roles,
    ua.agency_id,
    a.name as agencia,
    GROUP_CONCAT(DISTINCT ud.department_id ORDER BY ud.department_id SEPARATOR ', ') AS department_id,
    GROUP_CONCAT(DISTINCT d.name ORDER BY ud.department_id SEPARATOR ', ') AS departments
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN user_agencies ua ON u.id = ua.user_id
LEFT JOIN agencies a ON ua.agency_id = a.id
LEFT JOIN user_departments ud ON u.id = ud.user_id
LEFT JOIN departments d ON ud.department_id = d.id
GROUP BY u.id;
`
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.getUserById = async (req, res) => {
  let connection;
  try {
    const { userId } = req.params;
    connection = await getMainDb();
    const [users] = await connection.query(
      `SELECT
        u.id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.is_active,
        GROUP_CONCAT(DISTINCT r.id ORDER BY r.id SEPARATOR ', ') AS role_id,
        GROUP_CONCAT(DISTINCT r.name ORDER BY r.id SEPARATOR ', ') AS roles,
        ua.agency_id,
        a.name as agencia,
        GROUP_CONCAT(DISTINCT ud.department_id ORDER BY ud.department_id SEPARATOR ', ') AS department_id,
        GROUP_CONCAT(DISTINCT d.name ORDER BY ud.department_id SEPARATOR ', ') AS departments
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      LEFT JOIN user_agencies ua ON u.id = ua.user_id
      LEFT JOIN agencies a ON ua.agency_id = a.id
      LEFT JOIN user_departments ud ON u.id = ud.user_id
      LEFT JOIN departments d ON ud.department_id = d.id
      WHERE u.id = ?
      GROUP BY u.id`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = users[0];

    user.department_id = user.department_id ? user.department_id.split(', ').map(Number) : [];
    user.departments = user.departments ? user.departments.split(', ') : [];

    res.json(user);
  } catch (error) {
    console.error('Error en getUserById:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    if (connection) connection.release();
  }
};


exports.updateUser = async (req, res) => {
  let connection;
  try {
    const { userId } = req.params;
    const updateFields = req.body;
    connection = await getMainDb();


    const [existingUser] = await connection.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const fieldsToUpdate = {};
    const allowedFields = ['username', 'email', 'phone_number', 'first_name', 'last_name'];
    
    allowedFields.forEach(field => {
      if (updateFields[field] !== undefined) {
        fieldsToUpdate[field] = updateFields[field];
      }
    });

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron campos para actualizar' });
    }

    const updateQuery = 'UPDATE users SET ' + 
      Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ') + 
      ' WHERE id = ?';

    await connection.query(
      updateQuery,
      [...Object.values(fieldsToUpdate), userId]
    );

    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.deleteUser = async (req, res) => {
  let connection;
  try {
    const { userId } = req.params;
    connection = await getMainDb();

    const [existingUser] = await connection.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await connection.query('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.assignRoleToUser = async (req, res) => {
  let connection;
  try {
    const { userId, roleId } = req.body;
    connection = await getMainDb();
    await connection.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)', [userId, roleId]);
    res.status(201).json({ message: 'Rol asignado al usuario exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al asignar rol al usuario', error: error.message });
  } finally {
    releaseConnection(connection);
  }
};

exports.getRolesForUser = async (req, res) => {
  let connection;
  try {
    const { userId } = req.params;
    connection = await getMainDb();
    const [rows] = await connection.query(
      'SELECT r.id, r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?',
      [userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener roles del usuario', error: error.message });
  } finally {
    releaseConnection(connection);
  }
};

exports.getAllUserRoles = async (req, res) => {
  let connection;
  try {
    connection = await getMainDb();
    const [rows] = await connection.query(
      'SELECT ur.user_id, u.username, ur.role_id, r.name AS role_name FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener roles de usuarios', error: error.message });
  } finally {
    releaseConnection(connection);
  }
};

exports.updateUserRole = async (req, res) => {
  let connection;
  try {
    const { userId, oldRoleId, newRoleId } = req.body;
    connection = await getMainDb();
    await connection.query('UPDATE user_roles SET role_id = ? WHERE user_id = ? AND role_id = ?', [newRoleId, userId, oldRoleId]);
    res.json({ message: 'Rol de usuario actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar rol de usuario', error: error.message });
  } finally {
    releaseConnection(connection);
  }
};

exports.deleteUserRole = async (req, res) => {
  let connection;
  try {
    const { userId, roleId } = req.params;
    connection = await getMainDb();
    await connection.query('DELETE FROM user_roles WHERE user_id = ? AND role_id = ?', [userId, roleId]);
    res.json({ message: 'Rol de usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar rol de usuario', error: error.message });
  } finally {
    releaseConnection(connection);
  }
};

exports.getUsersByRole = async (req, res) => {
  let connection;
  try {
    const { roleId } = req.params;
    connection = await getMainDb();
    const [rows] = await connection.query(
      'SELECT u.id, u.username, u.email, u.first_name, u.last_name FROM users u JOIN user_roles ur ON u.id = ur.user_id WHERE ur.role_id = ?',
      [roleId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios por rol', error: error.message });
  } finally {
    releaseConnection(connection);
  }
};

exports.getCurrentUser = async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;
    connection = await getMainDb();

    const [users] = await connection.query('SELECT id, username, email, first_name, last_name, is_active FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = users[0];
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) connection.release();
  }
};

