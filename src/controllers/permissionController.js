// src/controllers/permissionController.js
const { getMainDb } = require('../config/database');

exports.getAllPermissions = async (req, res) => {
  let connection;
  try {
    connection = await getMainDb();
    const [rows] = await connection.query('SELECT * FROM permissions');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving permissions', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.createPermission = async (req, res) => {
  let connection;
  try {
    const { name } = req.body;
    connection = await getMainDb();
    const [result] = await connection.query('INSERT INTO permissions (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    res.status(500).json({ message: 'Error creating permission', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

