const { getMainDb } = require('../config/database');

const getConnection = async () => await getMainDb();
const releaseConnection = (connection) => { if (connection) connection.release(); };

exports.getAllUserAgencies = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.query(`
      SELECT ua.user_id, u.username, ua.agency_id, a.name AS agency_name
      FROM user_agencies ua
      JOIN users u ON ua.user_id = u.id
      JOIN agencies a ON ua.agency_id = a.id
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user agencies', error: error.message });
  } finally {
    releaseConnection(connection);
  }
};

exports.getUserAgencies = async (req, res) => {
  let connection;
  try {
    const { userId } = req.params;
    connection = await getConnection();
    const [rows] = await connection.query(`
      SELECT ua.agency_id, a.name AS agency_name
      FROM user_agencies ua
      JOIN agencies a ON ua.agency_id = a.id
      WHERE ua.user_id = ?
    `, [userId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user agencies', error: error.message });
  } finally {
    releaseConnection(connection);
  }
};

exports.assignAgencyToUser = async (req, res) => {
  let connection;
  try {
    const { userId } = req.params;
    const { agency_id } = req.body;

    connection = await getConnection();
    
    const [userExists] = await connection.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (userExists.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const [agencyExists] = await connection.query('SELECT id FROM agencies WHERE id = ?', [agency_id]);
    if (agencyExists.length === 0) {
      return res.status(404).json({ message: 'Agencia no encontrada' });
    }

    // Insertamos la nueva relación usuario-agencia
    await connection.query(
      'INSERT INTO user_agencies (user_id, agency_id) VALUES (?, ?)',
      [userId, agency_id]
    );

    res.status(201).json({ message: 'Relación usuario-agencia creada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la relación usuario-agencia', error: error.message });
  } finally {
    releaseConnection(connection);
  }
};

exports.removeAgencyFromUser = async (req, res) => {
  let connection;
  try {
    const { userId, agencyId } = req.params;
    connection = await getConnection();
    await connection.query('DELETE FROM user_agencies WHERE user_id = ? AND agency_id = ?', [userId, agencyId]);
    res.json({ message: 'User agency relation removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing user agency relation', error: error.message });
  } finally {
    releaseConnection(connection);
  }
};

exports.getUsersByAgency = async (req, res) => {
  let connection;
  try {
    const { agencyId } = req.params;
    connection = await getConnection();
    const [rows] = await connection.query(`
      SELECT u.id, u.username, u.email, u.first_name, u.last_name
      FROM users u
      JOIN user_agencies ua ON u.id = ua.user_id
      WHERE ua.agency_id = ?
    `, [agencyId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users by agency', error: error.message });
  } finally {
    releaseConnection(connection);
  }
};