const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middlewares/auth');

router.get('/',  ticketController.getAllTickets);
router.post('/', authMiddleware, ticketController.createTicket);
router.get('/:id', authMiddleware, ticketController.getTicketById);
router.put('/:id', authMiddleware, ticketController.updateTicket);
router.delete('/:id', authMiddleware, ticketController.deleteTicket);
router.get('/client/:clientId', authMiddleware, ticketController.getTicketsByClientId);
// router.get('/agency/:agencyId', authMiddleware, ticketController.getTicketsByAgency);


module.exports = router;