const { getMainDb } = require('../config/database');

exports.getAllRoles = async (req, res) => {
  let connection;
  try {
    connection = await getMainDb();
    const [rows] = await connection.query('SELECT * FROM roles');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving roles', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.createRole = async (req, res) => {
  let connection;
  try {
    const { name } = req.body;
    connection = await getMainDb();
    const [result] = await connection.query('INSERT INTO roles (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    res.status(500).json({ message: 'Error creating role', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

