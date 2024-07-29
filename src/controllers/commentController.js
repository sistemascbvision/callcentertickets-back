const { getMainDb } = require('../config/database');

const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');

const getUserFromToken = async (req, connection) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw new Error('No token provided');
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [users] = await connection.query('SELECT u.*, r.name AS role_name FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id WHERE u.id = ?', [decoded.id]);
  if (users.length === 0) {
    throw new Error('User not found');
  }
  const [agencies] = await connection.query('SELECT a.* FROM agencies a JOIN user_agencies ua ON a.id = ua.agency_id WHERE ua.user_id = ?', [decoded.id]);
  return {...users[0], agencies};
};

exports.getTicketComments = async (req, res) => {
  let connection;
  try {
    connection = await getMainDb();
    const user = await getUserFromToken(req, connection);
    const ticketId = req.params.ticketId;

    const query = `
      SELECT tc.*, u.first_name, u.last_name, u.username
      FROM ticket_comments tc
      JOIN users u ON tc.user_id = u.id
      WHERE tc.ticket_id = ?
      ORDER BY tc.created_at DESC
    `;

    const [comments] = await connection.query(query, [ticketId]);

    const formattedComments = comments.map(comment => ({
      id: comment.id,
      ticket_id: comment.ticket_id,
      user_id: comment.user_id,
      comment: comment.comment,
      created_at: moment(comment.created_at).tz('America/Guayaquil').format('YYYY-MM-DD HH:mm:ss'), // Ajuste de zona horaria
      first_name: comment.first_name,
      last_name: comment.last_name,
      username: comment.username
    }));

    res.json({
      comments: formattedComments,
      user: {
        id: user.id,
        username: user.username,
        role: user.role_name,
        agencies: user.agencies
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving ticket comments', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.createComment = async (req, res) => {
  let connection;
  try {
    connection = await getMainDb();
    const user = await getUserFromToken(req, connection);
    const ticketId = req.params.ticketId;
    const { comment } = req.body;

    const [result] = await connection.query(
      'INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)',
      [ticketId, user.id, comment]
    );

    const [newComment] = await connection.query(
      `SELECT tc.*, u.first_name, u.last_name, u.username
       FROM ticket_comments tc
       JOIN users u ON tc.user_id = u.id
       WHERE tc.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      comment: {
        id: newComment[0].id,
        ticket_id: newComment[0].ticket_id,
        user_id: newComment[0].user_id,
        comment: newComment[0].comment,
        created_at: moment(newComment[0].created_at).tz('America/Guayaquil').format('YYYY-MM-DD HH:mm:ss'), // Ajuste de zona horaria
        first_name: newComment[0].first_name,
        last_name: newComment[0].last_name,
        username: newComment[0].username
      },
      user: {
        id: user.id,
        username: user.username,
        role: user.role_name,
        agencies: user.agencies
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating comment', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.updateComment = async (req, res) => {
  let connection;
  try {
    connection = await getMainDb();
    const user = await getUserFromToken(req, connection);
    const commentId = req.params.commentId;
    const { comment } = req.body;

    const [existingComment] = await connection.query('SELECT * FROM ticket_comments WHERE id = ?', [commentId]);
    if (existingComment.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (existingComment[0].user_id !== user.id && user.role_name !== 'Administrador') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await connection.query(
      'UPDATE ticket_comments SET comment = ? WHERE id = ?',
      [comment, commentId]
    );

    const [updatedComment] = await connection.query(
      `SELECT tc.*, u.first_name, u.last_name, u.username
       FROM ticket_comments tc
       JOIN users u ON tc.user_id = u.id
       WHERE tc.id = ?`,
      [commentId]
    );

    res.json({
      comment: {
        id: updatedComment[0].id,
        ticket_id: updatedComment[0].ticket_id,
        user_id: updatedComment[0].user_id,
        comment: updatedComment[0].comment,
        created_at: moment(updatedComment[0].created_at).tz('America/Guayaquil').format('YYYY-MM-DD HH:mm:ss'), // Ajuste de zona horaria
        first_name: updatedComment[0].first_name,
        last_name: updatedComment[0].last_name,
        username: updatedComment[0].username
      },
      user: {
        id: user.id,
        username: user.username,
        role: user.role_name,
        agencies: user.agencies
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.deleteComment = async (req, res) => {
  let connection;
  try {
    connection = await getMainDb();
    const user = await getUserFromToken(req, connection);
    const commentId = req.params.commentId;

    const [existingComment] = await connection.query('SELECT * FROM ticket_comments WHERE id = ?', [commentId]);
    if (existingComment.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (existingComment[0].user_id !== user.id && user.role_name !== 'Administrador') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await connection.query('DELETE FROM ticket_comments WHERE id = ?', [commentId]);

    res.json({
      message: 'Comment deleted successfully',
      user: {
        id: user.id,
        username: user.username,
        role: user.role_name,
        agencies: user.agencies
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};
