const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.get('/:ticketId', commentController.getTicketComments);
router.post('/:ticketId', commentController.createComment);
// router.put('/comments/:commentId', commentController.updateComment);
// router.delete('/comments/:commentId', commentController.deleteComment);

module.exports = router;