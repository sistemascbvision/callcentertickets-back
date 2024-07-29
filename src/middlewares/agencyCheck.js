// src/middlewares/agencyCheck.js
const { getMainDb } = require('../config/database');

module.exports = async (req, res, next) => {
  const { userId } = req.userData;
  const { agencyId } = req.params;

  let connection;
  try {
    connection = await getMainDb();
    const [rows] = await connection.query(
      'SELECT * FROM user_agencies WHERE user_id = ? AND agency_id = ?',
      [userId, agencyId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: 'Access denied for this agency' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) connection.release();
  }
};

