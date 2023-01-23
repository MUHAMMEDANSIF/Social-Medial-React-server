/* eslint-disable linebreak-style */
const io = require('socket.io')(8000, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

let activeUser = [];

io.on('connection', (socket) => {
  socket.on('new-user-add', (newUserId) => {
    if (!activeUser.some((user) => user.userId === newUserId)) {
      activeUser.push({
        userId: newUserId,
        socketId: socket.id,
      });
    }
    console.log('Connected User', activeUser);
    io.emit('get-users', activeUser);
  });

  socket.on('send-message', (data) => {
    console.log(data);
    console.log('active user', activeUser);
    console.log('sending from socket to : ', data.receiverid);
    console.log('data :', data);
    activeUser.forEach((user) => {
      if (user.userId === data.receiverid) {
        io.to(user.socketId).emit('recevie-messages', data);
      }
    });
  });

  socket.on('disconnect', () => {
    activeUser = activeUser.filter((user) => user.socketId !== socket.id);
    console.log('User disconnected', activeUser);
    io.emit('get-users', activeUser);
  });
});
