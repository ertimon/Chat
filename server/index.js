const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const connections = [];
const rooms = { public: [] };

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');

  next();
});
//list of rooms
app.get('/enter', (req, res) => {
  const key = Math.random().toString(36).substring(7);
  rooms[key] = [];
  res.send({ key });
});

http.listen(8080, () => {
  console.log('listening on *:8080');
});

io.on('connection', (socket) => {
  if (!socket.handshake.query || !socket.handshake.query.user) {
    console.error('No name user');
    return;
  }

  const { user, room = 'public' } = socket.handshake.query;
  connections.push(socket);
//rooms users
  connections.filter(c => c && c.handshake.query.room === room).forEach((c, i, arr) => {
    const roomUsers = arr.map(a => a.handshake.query.user);
    c.emit('USERS', { users: roomUsers });
  });
//chat
  socket.on('SEND_MESSAGE', (data, back) => {
    const { message } = data;
    rooms[room].push({ user, message});

    connections.filter(c => c.handshake.query.room === room).forEach(c => {
      c.emit('NEW_MESSAGES', { messages: rooms[room] });
    }); // Return to room users
  });

  socket.on('GET_MESSAGES', (back) => {
    back({ messages: (rooms[room] || []) });
  });

  socket.on('disconnect', () => {
    const connectionIndex = connections.findIndex(conn => conn && conn.id === socket.id);
    if (connectionIndex > -1) {
      delete connections[connectionIndex];
    }

    connections.filter(c => c && c.handshake.query.room === room).forEach((c, i, arr) => {
      const roomUsers = arr.map(a => a.handshake.query.user);
      c.emit('USERS', { users: roomUsers });
    });
  })
});
