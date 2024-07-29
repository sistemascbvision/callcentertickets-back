const { getMainDb } = require('../config/database');

exports.getAllDepartments = async (req, res) => {
  let connection;
  try {
    connection = await getMainDb();
    const [rows] = await connection.query('SELECT * FROM departments');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving departments', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.createDepartment = async (req, res) => {
  let connection;
  try {
    const { name } = req.body;
    connection = await getMainDb();
    const [result] = await connection.query('INSERT INTO departments (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    res.status(500).json({ message: 'Error creating department', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

