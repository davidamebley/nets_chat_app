const express = require('express');
require('dotenv').config();
const http = require('http');
const Websocket = require('ws');

const PORT = process.env.PORT || 5000;
const server = http.createServer(express);
const wss = new Websocket.Server({ server });


// We keep track of the connected clients
let clients = [];

// When a websocket client connects to our Server
wss.on("connection", (ws, req) =>{
    console.log("A new websocket client has connected");

    // Add new websocket client to connected clients
    clients.push(ws);

    // Manage incoming messages from the Websocket client
    ws.on("message", (message) =>{
        console.log(`A new message received: "${message}"`);

        // Parse the message
        let data;
        try {
            // Convert message JSON string to object
            data = JSON.parse(message);
        } catch (error) {
            console.log(`Error while parsing message: ${message}`);
            return;
        }

        // Manage 'login-type' messages
        if (data.login) {
            const username = data.login.username;
            const location = data.login.location;
            console.log(`User ${username} has connected from ${location}`);

            // Broadcast login message to all other connected clients
            const message = {
                message: {
                    text: `User ${username} has connected from ${location}`
                }
            };
            broadcast(JSON.stringify(message));
        }

        // Manage chat messages
        if (data.message) {
            const username = getUsername(ws);

            if (!username) {
                console.log('Error: Client not logged in')
                return;
            }

            const messageText = data.message.text;
            console.log(`${username} sent: ${messageText}`);

            // Broadcast message text to all other connected clients
            const message = {
                message: {
                    text: `${username} sent: ${messageText}`
                }
            };
            broadcast(JSON.stringify(message));
        }
    });

    // Manage Websocket disconnections
    ws.on("close", () =>{
        console.log('Client diconnected');

        // Update client list
        clients = clients.filter((client) => client !== ws);
    });
});

// Function to broadcast message notifications to connected clients
const broadcast = (message) =>{
    clients.forEach((client) => {
        // If client connected
        if (client.readyState === Websocket.OPEN) {
            client.send(message);
        }
    });
}

// Function to get Username from client
const getUsername = (client) =>{
    for (const [username, ws] of Object.entries(wss.clients)) {
        if (client === ws) {
            return username;
        }
    }
    return null;
}

// Start server
server.listen(PORT, () =>{
    console.log(`Server is listening on port ${PORT}`);
})