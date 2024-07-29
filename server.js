require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const { testConnection } = require('./src/config/database');
const { swaggerUi, swaggerDocs } = require('./src/config/swaggerConfig');
const socketHandler = require('./src/config/socketHandler');

// Importar rutas
const sucursalRoutes = require('./src/routes/sucursalRoutes');
const clienteRoutes = require('./src/routes/clienteRoutes');
const agencyRoutes = require('./src/routes/agencyRoutes');
const roleRoutes = require('./src/routes/roleRoutes');
const userRoutes = require('./src/routes/userRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const permissionRoutes = require('./src/routes/permissionRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');
const commentRoutes = require('./src/routes/commentRoutes');
const userRoleRoutes = require('./src/routes/userRoleRoutes');
const userAgenciesRoutes = require('./src/routes/userAgenciesRoutes');
const rolePermissionRoutes = require('./src/routes/rolePermissionRoutes');
const userDepartmentRoutes = require('./src/routes/userDepartmentRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.REACT_APP_CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Usar rutas
app.use('/api/sucursales', sucursalRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/rolep', rolePermissionRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/userAgencies', userAgenciesRoutes);
app.use('/api/userRoles', userRoleRoutes);
app.use('/api/userDepartments', userDepartmentRoutes);

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Inicializar el manejador de Socket.IO
socketHandler(io);

const PORT = process.env.PORT || 3000;

testConnection().then(() => {
  server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Documentación de la API disponible en http://localhost:${PORT}/api-docs`);
    console.log(`WebSocket server iniciado`);
  });
});