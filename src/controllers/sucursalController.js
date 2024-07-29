const { getSucursalesDb } = require('../config/database');

exports.getSucursales = async (req, res) => {
  try {
    const db = await getSucursalesDb();
    const [rows] = await db.execute("SELECT * FROM sucursal WHERE estado = 0");
    db.release(); // Liberar la conexión de vuelta al pool

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getSucursal = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getSucursalesDb();
    const [rows] = await db.execute("SELECT * FROM sucursal WHERE id_sucursal = ?", [id]);
    db.release(); // Liberar la conexión de vuelta al pool

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sucursal no encontrada' });
    }

    const sucursal = rows[0];
    const tipo = sucursal.nombre.startsWith('TV') ? "TV" : "Internet";
    const mensaje = `Se ha conectado a la base de datos de: ${sucursal.nombre} (${tipo})`;

    res.json({ sucursal, mensaje });
  } catch (error) {
    console.error('Error al obtener sucursal:', error);
    res.status(500).json({ error: error.message });
  }
};
