const { getMainDb } = require('../config/database');

const jwt = require('jsonwebtoken');

const validateAgency = async (connection, agencyId) => {
  const [agencies] = await connection.query('SELECT * FROM agencies WHERE id = ?', [agencyId]);
  if (agencies.length === 0) {
    throw new Error('Invalid agency ID');
  }
};

const validateDepartment = async (connection, departmentId) => {
  if (departmentId === null || departmentId === 0) {
    return; // No se necesita validar si el departamento no está especificado
  }
  const [departments] = await connection.query('SELECT * FROM departments WHERE id = ?', [departmentId]);
  if (departments.length === 0) {
    throw new Error('Invalid department ID');
  }
};

const getUserFromToken = async (req, connection) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw new Error('No token provided');
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [users] = await connection.query(`
    SELECT u.*, r.name AS role_name, d.id AS department_id, d.name AS department_name 
    FROM users u 
    JOIN user_roles ur ON u.id = ur.user_id 
    JOIN roles r ON ur.role_id = r.id 
    LEFT JOIN user_departments ud ON u.id = ud.user_id
    LEFT JOIN departments d ON ud.department_id = d.id
    WHERE u.id = ?
  `, [decoded.id]);
  if (users.length === 0) {
    throw new Error('User not found');
  }
  const [agencies] = await connection.query('SELECT a.* FROM agencies a JOIN user_agencies ua ON a.id = ua.agency_id WHERE ua.user_id = ?', [decoded.id]);
  return {...users[0], agencies};
};



exports.getAllTickets = async (req, res) => {
  let connection;
  try {
    connection = await getMainDb();
    const user = await getUserFromToken(req, connection);
   
    let query = `
      SELECT t.*, a.name AS agency_name,
             u.username AS created_by_username,
             u.first_name AS created_by_first_name,
             u.phone_number AS created_by_phone,
             d.name AS department_name
      FROM tickets t
      LEFT JOIN agencies a ON t.agency_id = a.id
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN departments d ON t.department_id = d.id
    `;
    const params = [];
    let whereClause = [];

    // filtrar por agencia si el usuario tiene agencias asignadas
    if (user.agencies && user.agencies.length > 0) {
      whereClause.push('t.agency_id IN (?)');
      params.push(user.agencies.map(a => a.id));
    }

    // filtrar por departamento
    if (user.department_id) {
      whereClause.push('(t.department_id = ? OR t.department_id IS NULL)');
      params.push(user.department_id);
    }

    // Si el usuario no tiene departamento y no agencias, puede ver todos los tickets (como un administrador)
    if (whereClause.length > 0) {
      query += ' WHERE ' + whereClause.join(' AND ');
    }

    const [rows] = await connection.query(query, params);
    const tickets = rows.map(ticket => ({
      ...ticket,
      departmentMessage: ticket.department_id ? null : "Este ticket no está delimitado por departamento"
    }));

    res.json({
      tickets: tickets,
      user: {
        id: user.id,
        username: user.username,
        role: user.role_name,
        agencies: user.agencies,
        department_id: user.department_id,
        department_name: user.department_name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving tickets', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.createTicket = async (req, res) => {
  let connection;
  try {
    connection = await getMainDb();
    const user = await getUserFromToken(req, connection);
    const { agencyId, departmentId, title, description, priority, requesterName, requesterContact, clientId, contractId, status } = req.body;
    
    await validateAgency(connection, agencyId);
    await validateDepartment(connection, departmentId);

    if (user.role_name !== 'Administrador' && user.agencies.length > 0 && !user.agencies.some(a => a.id === agencyId)) {
      return res.status(403).json({ message: 'You do not have permission to create a ticket for this agency' });
    }

    const [result] = await connection.query(
      'INSERT INTO tickets (created_by, agency_id, department_id, title, description, priority, requester_name, requester_contact, status, client_id, contract_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user.id, agencyId, departmentId, title, description, priority, requesterName, requesterContact, status, clientId, contractId]
    );

    const [departmentName] = await connection.query('SELECT name FROM departments WHERE id = ?', [departmentId]);

    res.status(201).json({ 
      id: result.insertId,  // Aquí devolvemos un id directamente
      createdBy: user.id,
      createdByUsername: user.username,
      createdByFirstName: user.first_name,
      createdByPhone: user.phone_number,
      agencyId, 
      departmentId,
      departmentName: departmentId ? departmentName[0].name : null,
      title,
      description, 
      priority,
      requesterName,
      requesterContact,
      status,
      clientId,
      contractId,
      user: {
        id: user.id,
        username: user.username,
        role: user.role_name,
        agencies: user.agencies
      }
    });

  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Error creating ticket', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};


exports.getTicketsByClientId = async (req, res) => {
  let connection;
  try {
    connection = await getMainDb();
    const user = await getUserFromToken(req, connection);
    const clientId = req.params.clientId;
    let query = `
      SELECT * FROM tickets WHERE client_id = ?;
    `;
    const params = [clientId];
    const [rows] = await connection.query(query, params);
    res.json({
      tickets: rows,
      user: {
        id: user.id,
        username: user.username,
        role: user.role_name,
        agencies: user.agencies
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'No es posible obtener los tickets del cliente', error: error.message });
  }
  };


exports.getTicketById = async (req, res) => {
  let connection;
  try {
    connection = await getMainDb();
    const user = await getUserFromToken(req, connection);
    const ticketId = req.params.id;
    
    let query = `
      SELECT t.*, a.name AS agency_name, 
             u.username AS created_by_username, 
             u.first_name AS created_by_first_name, 
             u.phone_number AS created_by_phone
      FROM tickets t 
      LEFT JOIN agencies a ON t.agency_id = a.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = ?
    `;
    const params = [ticketId];

    if (user.role_name !== 'Administrador' && user.agencies.length > 0) {
      query += ' AND t.agency_id IN (?)';
      params.push(user.agencies.map(a => a.id));
    }

    const [rows] = await connection.query(query, params);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Ticket not found or access denied' });
    }
    
    res.json({
      ticket: rows[0],
      user: {
        id: user.id,
        username: user.username,
        role: user.role_name,
        agencies: user.agencies
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving ticket', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.updateTicket = async (req, res) => {
  let connection;
  try {
    connection = await getMainDb();
    const user = await getUserFromToken(req, connection);
    const ticketId = req.params.id;
    const { action, department_id, ...otherFields } = req.body;

    // Verificamos que el ticket existe
    const [ticketResult] = await connection.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    if (ticketResult.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    const ticket = ticketResult[0];

    let updateFields = {};
    const currentTime = new Date();

    if (action) {
      switch (action) {
        case 'start':
          if (ticket.status !== 'open') {
            return res.status(400).json({ message: 'Ticket iniciado' });
          }
          updateFields = {
            status: 'in_progress',
            started_at: currentTime,
            assigned_to: user.id
          };
          break;
        case 'resolve':
          if (ticket.status !== 'in_progress') {
            return res.status(400).json({ message: 'Ticket resuelto' });
          }
          updateFields = {
            status: 'resolved',
            resolved_at: currentTime
          };
          break;
        case 'close':
          if (user.role_name !== 'Control de Calidad') {
            return res.status(403).json({ message: 'Solo control de calidad puede cerrar tickets' });
          }
          if (ticket.status !== 'resolved') {
            return res.status(400).json({ message: 'Ticket cerrado' });
          }
          updateFields = {
            status: 'closed',
            closed_at: currentTime
          };
          break;
        default:
          return res.status(400).json({ message: 'Invalid action' });
      }
    } else if (department_id !== undefined) {
      // Si se proporciona department_id, actualizamos el departamento
      await validateDepartment(connection, department_id);
      updateFields.department_id = department_id;
    } else {
      // Si no hay action ni department_id, actualizamos otros campos si los hay
      updateFields = { ...otherFields };
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    // Actualizamos el ticket
    await connection.query(
      'UPDATE tickets SET ? WHERE id = ?',
      [{ ...updateFields, updated_at: currentTime }, ticketId]
    );

    // Obtenems el ticket actualizado
    const [updatedTicket] = await connection.query(`
      SELECT t.*, a.name AS agency_name,
             u.username AS created_by_username,
             u.first_name AS created_by_first_name,
             u.phone_number AS created_by_phone,
             d.name AS department_name
      FROM tickets t
      LEFT JOIN agencies a ON t.agency_id = a.id
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN departments d ON t.department_id = d.id
      WHERE t.id = ?
    `, [ticketId]);

    const ticketResponse = {
      ...updatedTicket[0],
      departmentMessage: updatedTicket[0].department_id ? null : "Este ticket no está delimitado por departamento"
    };

    res.json({
      message: 'Ticket updated successfully',
      ticket: ticketResponse
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ message: 'Error updating ticket', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};


exports.deleteTicket = async (req, res) => {
  let connection;
  try {
    connection = await getMainDb();
    const user = await getUserFromToken(req, connection);
    const ticketId = req.params.id;
    
    const [ticket] = await connection.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    if (ticket.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (user.role_name !== 'Administrador' && user.agencies.length > 0 && !user.agencies.some(a => a.id === ticket[0].agency_id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await connection.query('DELETE FROM tickets WHERE id = ?', [ticketId]);
    res.json({
      message: 'Ticket eliminado exitosamente',
      user: {
        id: user.id,
        username: user.username,
        role: user.role_name,
        agencies: user.agencies
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting ticket', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};




