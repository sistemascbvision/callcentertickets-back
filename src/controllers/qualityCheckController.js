const { getMainDb } = require('../config/database');

exports.getAllQualityChecks = async (req, res) => {
  let connection;
  try {
    connection = await getMainDb();
    const [rows] = await connection.query('SELECT * FROM quality_checks');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving quality checks', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = new QualityCheckController();