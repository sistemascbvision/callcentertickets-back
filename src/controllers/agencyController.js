// src/controllers/agencyController.js
const { getMainDb } = require('../config/database');

exports.getAllAgencies = async (req, res) => {
  let connection;
  try {
    connection = await getMainDb();
    const [rows] = await connection.query('SELECT * FROM agencies');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving agencies', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.createAgency = async (req, res) => {
  let connection;
  try {
    const { name, location } = req.body;
    connection = await getMainDb();
    const [result] = await connection.query('INSERT INTO agencies (name, location) VALUES (?, ?)', [name, location]);
    res.status(201).json({ id: result.insertId, name, location });
  } catch (error) {
    res.status(500).json({ message: 'Error creating agency', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.getAgencyById = async (req, res) => {
  let connection;
  try {
    const agencyId = req.params.id;
    connection = await getMainDb();
    const [rows] = await connection.query('SELECT * FROM agencies WHERE id = ?', [agencyId]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Agency not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving agency', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.updateAgency = async (req, res) => {
  let connection;
  try {
    const agencyId = req.params.id;
    const { name, location } = req.body;
    connection = await getMainDb();
    await connection.query('UPDATE agencies SET name = ?, location = ? WHERE id = ?', [name, location, agencyId]);
    res.json({ message: 'Agency updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating agency', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.deleteAgency = async (req, res) => {
  let connection;
  try {
    const agencyId = req.params.id;
    connection = await getMainDb();
    await connection.query('DELETE FROM agencies WHERE id = ?', [agencyId]);
    res.json({ message: 'Agency deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting agency', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};
