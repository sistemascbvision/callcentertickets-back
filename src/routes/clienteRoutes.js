const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Obtener todos los clientes de una sucursal
router.get('/:sucursalId', clienteController.getClientes);

// Obtener un cliente por ID
router.get('/:sucursalId/cliente/:id', clienteController.getClienteById);

// Buscar clientes por término
router.get('/:sucursalId/buscar', clienteController.buscarClientes);
///api/clientes/1/buscar?termino=ana

module.exports = router;
