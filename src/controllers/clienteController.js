const { getClientesDb } = require('../config/database');

exports.getClientes = async (req, res) => {
  try {
    const { sucursalId } = req.params;
    const { connection, sucursalInfo } = await getClientesDb(sucursalId);

    const [rows] = await connection.execute(`
      SELECT c.Cod_Cliente, c.Nombre1, c.Nombre2, c.Apellido1, c.Apellido2, c.Direccion, 
             c.Telefono, c.Ruc, c.Estado, c.Celular, c.Observacion, c.email, 
             c.fecha_naci, o.Cod_OrdenT AS Numero_Contrato
      FROM clientes c
      LEFT JOIN ordent o ON c.Cod_Cliente = o.Cod_Cliente
    `);
    await connection.end();

    const clientesAgrupados = rows.reduce((acc, row) => {
      if (!acc[row.Cod_Cliente]) {
        acc[row.Cod_Cliente] = { ...row, contratos: [] };
      }
      if (row.Numero_Contrato) {
        acc[row.Cod_Cliente].contratos.push(row.Numero_Contrato);
      }
      return acc;
    }, {});

    const clientes = Object.values(clientesAgrupados);

    res.json({
      mensaje: `Clientes de la bd ${sucursalInfo.nombre_base}`,
      clientes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClienteById = async (req, res) => {
  try {
    const { sucursalId, id } = req.params;
    const { connection, sucursalInfo } = await getClientesDb(sucursalId);

    const [rows] = await connection.execute(`
      SELECT c.*, o.Cod_OrdenT AS Numero_Contrato
      FROM clientes c
      LEFT JOIN ordent o ON c.Cod_Cliente = o.Cod_Cliente
      WHERE c.Cod_Cliente = ?
    `, [id]);
    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const cliente = rows[0];
    cliente.contratos = rows.map(r => r.Numero_Contrato).filter(Boolean);

    res.json({
      mensaje: `Cliente de la bd ${sucursalInfo.nombre_base}`,
      cliente
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.buscarClientes = async (req, res) => {
  try {
    const { sucursalId } = req.params;
    const { termino } = req.query;
    const { connection, sucursalInfo } = await getClientesDb(sucursalId);

    const palabras = termino.split(' ');
    const conditions = palabras.map(() => 
      `(c.Nombre1 LIKE ? OR c.Nombre2 LIKE ? OR
       c.Apellido1 LIKE ? OR c.Apellido2 LIKE ? OR
       c.Telefono LIKE ? OR c.Celular LIKE ?)`
    ).join(' AND ');

    const params = palabras.flatMap(palabra => Array(6).fill(`%${palabra}%`));

    const [rows] = await connection.execute(`
      SELECT c.*, o.Cod_OrdenT AS Numero_Contrato
      FROM clientes c
      LEFT JOIN ordent o ON c.Cod_Cliente = o.Cod_Cliente
      WHERE ${conditions}
    `, params);
    await connection.end();

    const clientesAgrupados = rows.reduce((acc, row) => {
      if (!acc[row.Cod_Cliente]) {
        acc[row.Cod_Cliente] = { ...row, contratos: [] };
      }
      if (row.Numero_Contrato) {
        acc[row.Cod_Cliente].contratos.push(row.Numero_Contrato);
      }
      return acc;
    }, {});

    const clientes = Object.values(clientesAgrupados);

    res.json({
      mensaje: `Clientes de la bd ${sucursalInfo.nombre_base}`,
      resultados: `Búsqueda realizada con éxito. Resultados encontrados: ${clientes.length}`,
      clientes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
