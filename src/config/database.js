// src/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la base de datos principal
// const mainDbConfig = {
//   host: process.env.MYSQL_HOST || 'localhost',
//   user: process.env.MYSQL_USER || 'root',
//   password: process.env.MYSQL_PASSWORD || '',
//   database: process.env.MYSQL_DB || 'ticket_system2',
//   connectionLimit: 10
// };


const mainDbConfig = {
  host: '10.10.254.10',
  user: 'sistemas',
  password: '2024@Pctel',
  database: 'callcenterdb',
  port: 3306,
  connectionLimit: 10
};


// Configuración de la base de datos de sucursales
const sucursalesDbConfig = {
  host: '10.10.254.10',
  user: 'sistemas',
  password: '2024@Pctel',
  database: 'bd_cbvision',
  port: 3306,
  // connectionLimit: 10
};

// Crear pools de conexiones
const mainPool = mysql.createPool(mainDbConfig);
const sucursalesPool = mysql.createPool(sucursalesDbConfig);

// Función para obtener una conexión de la base de datos principal
async function getMainDb() {
  return await mainPool.getConnection();
}

// moment.locale('es');
// Función para obtener una conexión de la base de datos de sucursales
async function getSucursalesDb() {
  return await sucursalesPool.getConnection();
}

// Función para obtener información de una sucursal
async function getSucursalInfo(sucursalId) {
  const connection = await getSucursalesDb();
  try {
    const [rows] = await connection.execute('SELECT * FROM sucursal WHERE id_sucursal = ?', [sucursalId]);
    if (rows.length === 0) {
      throw new Error(`No se encontró información para la sucursal con ID ${sucursalId}`);
    }
    return rows[0];
  } finally {
    connection.release(); // Liberar la conexión de vuelta al pool
  }
}

// Función para obtener una conexión a la base de datos de clientes de una sucursal específica
async function getClientesDb(sucursalId) {
  const sucursalInfo = await getSucursalInfo(sucursalId);
  const connection = await mysql.createConnection({
    host: sucursalInfo.ip,
    user: sucursalInfo.usuario,
    password: sucursalInfo.contrasenia,
    database: sucursalInfo.nombre_base,
    port: sucursalInfo.puerto,
  });
  
  return {
    connection,
    sucursalInfo
  };
}

// Función para probar la conexión
async function testConnection() {
  let connection;
  try {
    connection = await getMainDb();
    console.log('Conexión a la base de datos principal establecida correctamente.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos principal:', error);
  } finally {
    if (connection) connection.release();
  }
}

module.exports = {
  getMainDb,
  getSucursalesDb,
  getClientesDb,
  testConnection,
};
