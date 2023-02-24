const http = require('http');
const path = require('path');
require('dotenv').config();
const express = require('express');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');

const {checkPortInUse} = require('./helpers/functions');

const app = express();
const httpServer = http.createServer(app);

// Parse incoming request bodies in a middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve Frontend
if (process.env.NODE_ENV === 'production') {
    //Set the Build folder for our React Frontend
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    // Serve Static Index html file when other routes visited
    app.get('*', (req, res) =>
        res.sendFile(
            path.resolve(__dirname, '../', 'frontend', 'build', 'index.html')
        )
    )
}else{
    app.get('/', (req, res) =>
        res.send('Please set to a Production Environment first')
    )
}


// Define a POST route that accepts input values
app.post('/connect', async (req, res) => {
    const { serverUrl } = req.body;
    const socketPort = new URL(serverUrl).port;
    let currentUser;
    let clients = [];

    if (serverUrl) {
        // console.log('Received server address:', serverUrl);
    
        try {
          const inUse = await checkPortInUse(socketPort);
    
          if (inUse) {
            // console.log('Port already in use.');
            res.status(405).send('Port already in use.');   //Operation not allowed
            return;
          }
    
          const io = socketIO(httpServer, {
            cors: {
              origin: '*',
              methods: ['GET', 'POST', 'OPTIONS']
            }
          });
    
          io.listen(socketPort);
    
          res.status(200).send('WebSocket connection established');
    
          io.on('connection', (socket) => {
            // console.log(`WebSocket connection established with client ${socket.id}`);
    
            socket.on('message', (data) => {
                const receivedMessage = JSON.stringify(data);
                // console.log(`Received message: ${receivedMessage}`);

                // Broadcast to ALL clients
                // console.log(`User ID of message: ${data.message.userId}`)
                // io.emit('message', receivedMessage);
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

            socket.on('login', (data) =>{
                const username = data.login.username;
                const location = data.login.location;
                // console.log(`New Login: ${data.login.username}`);
                // Broadcast to other clients
                socket.broadcast.emit('login', JSON.stringify(
                    {   type: 'login',
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
                currentUser = data.login.username;
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
            //   console.log(`WebSocket connection closed from socket ${socket.id}`);
              // Get the index of disconnected client
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
            });
          });
    
          io.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
            //   console.error('Port already in use:', error);
            } else {
            //   console.error('WebSocket server error:', error);
            }
          });
        } catch (error) {
        //   console.error('Error checking if port is in use:', error);
          res.status(500).send('Error checking if port is in use');
        }
      } else {
        res.status(400).send('Invalid server URL');
      }
});


httpServer.listen(process.env.PORT || 8000, () => {
  console.log('HTTP server listening on port 8000');
});