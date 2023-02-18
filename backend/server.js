const express = require('express');
require('dotenv').config();
const http = require('http');
const Websocket = require('ws');

const PORT = process.env.PORT || 5000;
const server = http.createServer(express);
const wss = new Websocket.Server({ server });


// Start server
server.listen(PORT, () =>{
    console.log(`Server is listening on port ${PORT}`);
})