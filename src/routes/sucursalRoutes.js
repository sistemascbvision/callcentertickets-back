const express = require('express');
const router = express.Router();
const sucursalController = require('../controllers/sucursalController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Sucursal:
 *       type: object
 *       required:
 *         - nombre
 *         - direccion
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the sucursal
 *         nombre:
 *           type: string
 *           description: The name of the sucursal
 *         direccion:
 *           type: string
 *           description: The address of the sucursal
 *       example:
 *         id: 1
 *         nombre: Sucursal Centro
 *         direccion: Calle Falsa 123
 */

/**
 * @swagger
 * tags:
 *   name: Sucursales
 *   description: API to manage sucursales.
 */

/**
 * @swagger
 * /api/sucursales:
 *   get:
 *     summary: Retrieve a list of sucursales
 *     tags: [Sucursales]
 *     responses:
 *       200:
 *         description: A list of sucursales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sucursal'
 */
router.get('/', sucursalController.getSucursales);

/**
 * @swagger
 * /api/sucursales/{id}:
 *   get:
 *     summary: Get a sucursal by ID
 *     tags: [Sucursales]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The sucursal ID
 *     responses:
 *       200:
 *         description: A sucursal object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sucursal'
 *       404:
 *         description: Sucursal not found
 */
router.get('/:id', sucursalController.getSucursal);

module.exports = router;
