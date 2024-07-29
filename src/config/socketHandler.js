
const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado:', socket.id);

    socket.on('user_login', (user) => {
      console.log('Usuario ha iniciado sesión:', user.username);
      io.emit('user_connected', { message: `${user.username} ha iniciado sesión`, userId: user.id });
    });

    socket.on('user_logout', (data) => {
      console.log('Usuario ha cerrado sesión:', data.username);
      io.emit('user_disconnected', { username: data.username });
    });
    
//salas?????
    socket.on('join_room', (room) => {
      console.log(`Socket ${socket.id} se unió a la sala ${room}`);
      socket.join(room);
    });

    socket.on('create_ticket', (data) => {
      console.log('Ticket creado:', data);
      io.emit('ticket_created', {
        message: `Nuevo ticket #${data.ticketId} creado por ${data.createdBy} en la sucursal ${data.agencyName}`,
        ticketId: data.ticketId,
        createdBy: data.createdBy,
        title: data.title,
        agencyName: data.agencyName
      });
    });

    socket.on('comment_created', (data) => {
      console.log('Comentario añadido al ticket:', data);
      io.emit('ticket_commented', {
        message: `Nuevo comentario en ticket #${data.ticketId} por ${data.createdBy}`,
        ticketId: data.ticketId,
        createdBy: data.createdBy,
        commentId: data.commentId
      });
    });


    //codigo a corregir

    socket.on('update_ticket', (data) => {
      console.log('Ticket actualizado:', data);
      io.emit('ticket_updated', {
        message: `Ticket #${data.ticketId} actualizado por ${data.updatedBy}`,
        ticketId: data.ticketId,
        updatedBy: data.updatedBy,
        changes: data.changes
      });
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });
};

module.exports = socketHandler;


//los cambios son buenos




