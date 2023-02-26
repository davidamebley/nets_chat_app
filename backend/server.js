const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS']
  }
});

// ----------- DEPLOYMENT ---------------
// Serve Frontend
if (process.env.NODE_ENV === 'production') {
  //Set the Build folder for our React Frontend
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  // Serve Static Index html file when other routes visited
  app.get('/*', (req, res) =>
      res.sendFile(
          path.resolve(__dirname, '../', 'frontend', 'build', 'index.html')
      )
  )

}else{
  app.get('/', (req, res) =>
      res.send('Please set to a Production Environment first')
  )
}
// ----------- END OF DEPLOYMENT


let clients = [];

// Function to handle login
const handleLogin = (socket, data) => {
  const serverAddress = data.login.serverAddress;
  const username = data.login.username;
  const location = data.login.location;
  // remoteSocket.on('connect', () => {
  console.log(`Connected to server at ${serverAddress}`);
  console.log(`Socket with ID: ${socket.id} connected from ${location}`);

    
  // Broadcast to other clients
  socket.broadcast.emit('login', JSON.stringify({
          type: 'login',
          message:{
              text: `${username} connected from ${location}`,
          }
      }
  ));
  // Add to list of connected clients
  clients.push(
    {
        id: socket.id,
        username: username
    }
  )


  socket.on('message', (data) => {
    console.log('New Socket message', data);
    // Broadcast to ALL clients
    io.emit('message', JSON.stringify(
      {
          type: 'chat',
          message: {
              userId: data.message.userId,
              text: data.message.text
          }
      }
  ));
  });

  //Listen for typing event
  socket.on('userTyping', (username)=>{
    // Emit typing status to other users
    socket.broadcast.emit('userTypingBroadcast', username);
    // console.log('Typing event caught on server')
  });
  //Listen for stopped typing event
  socket.on('userStoppedTyping', ()=>{
      // Emit typing stopped status to other users
      socket.broadcast.emit('userStoppedTypingBroadcast', '');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    handleDisconnect(socket);
  });


};

// When Client Establishes Connection
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('login', (data) => {
    handleLogin(socket, data);
  });

  // Moved Stuff from here to onLogin
});

// Function to handle disconnections
const handleDisconnect = (socket) =>{
  const index = clients.findIndex(client => client.id === socket.id);
  let disconnectedUser = 'A user';
  // Check if index exists in list
  if (index > -1) {
    // Access the name property of the client object at that index
    disconnectedUser = clients[index].username;
    // If discon. client exists, remove client from list
    clients.splice(index, 1);
  }
  socket.broadcast.emit('logout', JSON.stringify(
    {
      type: 'logout',
      message:{
        text: `${disconnectedUser} left the chat`
      }
    }
  ))
}

// Start Server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
