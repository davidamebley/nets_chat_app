const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');

const {checkPortInUse} = require('./helpers/functions');

const app = express();
const httpServer = http.createServer(app);

// Parse incoming request bodies in a middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define a POST route that accepts input values
app.post('/connect', async (req, res) => {
    const { serverUrl } = req.body;
    const socketPort = new URL(serverUrl).port;

    if (serverUrl) {
        console.log('Received server address:', serverUrl);
    
        try {
          const inUse = await checkPortInUse(socketPort);
    
          if (inUse) {
            console.log('Port already in use.');
            res.status(405).send('Port already in use.');   //Operation not allowed
            return;
          }
    
          console.log('Outside reached');
    
          const io = socketIO(httpServer, {
            cors: {
              origin: '*',
              methods: ['GET', 'POST', 'OPTIONS']
            }
          });
    
          io.listen(socketPort);
    
          res.status(200).send('WebSocket connection established');
    
          io.on('connection', (socket) => {
            console.log('WebSocket connection established');
    
            socket.on('message', (data) => {
                const receivedMessage = JSON.stringify(data);
                console.log(`Received message: ${receivedMessage}`);
                // Broadcast to ALL clients
                console.log(`User ID of message: ${data.message.userId}`)
                io.emit('message', receivedMessage);
            });

            socket.on('login', (data) =>{
                const username = data.login.username;
                const location = data.login.location;
                console.log(`New Login: ${data.login.username}`);
                // Broadcast to other clients
                socket.broadcast.emit('login', JSON.stringify(
                    {
                        message:{
                            text: `${username} connected from ${location}`,
                        }
                    }
                ));
            })
    
            socket.on('disconnect', () => {
              console.log('WebSocket connection closed');
            });
          });
    
          io.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
              console.error('Port already in use:', error);
            } else {
              console.error('WebSocket server error:', error);
            }
          });
        } catch (error) {
          console.error('Error checking if port is in use:', error);
          res.status(500).send('Error checking if port is in use');
        }
      } else {
        res.status(400).send('Invalid server URL');
      }
});


httpServer.listen(8000, () => {
  console.log('HTTP server listening on port 8000');
});