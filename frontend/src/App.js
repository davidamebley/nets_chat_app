import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

import './App.css';
import LoginForm from './components/LoginForm/LoginForm';
import Chat from './components/Chat/Chat';

const SERVER_URL = 'http://localhost:8080';

function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState(null);
  const [messages, setMessages] = useState([]);
  const [serverUrl, setServerUrl] = useState(SERVER_URL);
  const [isServerError, setIsServerError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [geoLocation, setGeoLocation] = useState('Unknown location');
  const [login, setLogin] = useState({});

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        console.log(`Connected to server at ${serverUrl}`);
        console.log(`Socket ID: ${socket.id}`);
      });

      socket.on('message', (message) => {
        console.log('Received message', message);
        setMessages((messages) => [...messages, message]);
      });
    }

    // console.log(`Checked Login location: ${geoLocation}`);
    getCurrentLocation();
    
  }, [socket]);

  // Function to handle Login connections
  const handleLogin = (serverAddress, username) => {
    // console.log(`Login location: ${getCurrentLocation()}`);
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

  // Function to get Geolocation
  const getCurrentLocation = () =>{
    if (navigator.geolocation) {
        // Get the user's current position
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
          setGeoLocation(`${latitude}, ${longitude}`)
        }, (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.error("User denied the request for Geolocation.");
              break;
            case error.POSITION_UNAVAILABLE:
              console.error("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              console.error("The request to get user location timed out.");
              break;
            case error.UNKNOWN_ERROR:
              console.error("An unknown error occurred.");
              break;
            default:
              console.error("An unknown error occurred.");
              setGeoLocation('Unknown location.')
          }
        });
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
}

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