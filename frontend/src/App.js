import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

import './App.css';
import LoginForm from './components/LoginForm/LoginForm';
import Chat from './components/Chat/Chat';
import {getCurrentLocation} from './helpers/functions';

const SERVER_URL = 'http://localhost:8080';

function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState(null);
  const [messages, setMessages] = useState([]);
  const [serverUrl, setServerUrl] = useState(SERVER_URL);
  const [isServerError, setIsServerError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [geoLocation, setGeoLocation] = useState('');
  const [login, setLogin] = useState({});

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        console.log(`Connected to server at ${serverUrl}`);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      socket.on('message', (message) => {
        console.log('Received message', message);
        setMessages((messages) => [...messages, message]);
      });
    }
    // Clean up the socket connection on component unmount 
    /* return () => { 
      socket.disconnect(); 
    }; */
  }, [socket]);

  // Function to handle Login connections
  const handleLogin = (serverAddress, username) => {
    console.log(`Login location: ${getCurrentLocation()}`);
    setServerUrl(serverAddress);
    if (socket) {
      socket.disconnect();
    }
    fetch(`/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ serverUrl: serverAddress }),
    })
      .then(async (response) => {
        if (response.status === 200 && !socket) {
          const newSocket = io(serverAddress, {
            transports: ['websocket'],
            query: { username },
          });
          setSocket(newSocket);
          setUsername(username);
          setGeoLocation(getCurrentLocation());
          if (newSocket) {
            newSocket.emit('login', {
              login:{
                username: `${username}`,
                location: `${geoLocation}`
              }
            })
          }
          console.log(`Username: ${username}; Socket: ${newSocket}`)
        } else if (response.status === 405) {
          const newSocket = io(serverAddress, {
            transports: ['websocket'],
            query: { username },
          });
          setSocket(newSocket);
          setUsername(username);
          setGeoLocation(getCurrentLocation());
          if (newSocket) {
            newSocket.emit('login', {
              login:{
                username: `${username}`,
                location: `${geoLocation}`
              }
            })
          }
          console.log(`Username: ${username}; Socket: ${newSocket}`)
          // console.log(`New socket client with existing socket server port`)
          // setIsServerError(true);
          // setErrorText(await response.text());
        } else {
          console.error('WebSocket server connection failed');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="App">
      
      {username ? (
        <Chat socket={socket} username={username} serverAddress={serverUrl} />
      ) : (
        <LoginForm onLogin={handleLogin} isServerError={isServerError} errorText={errorText}/>
      )}
    </div>
  );
}

export default App;