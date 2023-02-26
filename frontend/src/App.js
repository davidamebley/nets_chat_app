import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

import './App.css';
import LoginForm from './components/LoginForm/LoginForm';
import Chat from './components/Chat/Chat';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState(null);
  const [messages, setMessages] = useState([]);
  const [serverUrl, setServerUrl] = useState(SERVER_URL);
  const [isServerError, setIsServerError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [geoLocation, setGeoLocation] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const regex = /^(http|https):\/\/[a-z0-9-]+(\.[a-z0-9-]+)*(:[0-9]+)?(\/.*)?$/;

  useEffect(() => {
    if (socket) {
      console.log(`Checked Login location: ${geoLocation}`);
      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('message', (message) => {
        setMessages((messages) => [...messages, message]);
      });
    }

    getCurrentLocation();
    
  }, [socket]);
  


  // Function to handle Login connections
  const handleLogin = async (serverAddress, newUsername) => {
    // Check valid server address
    const isValidUrl = regex.test(serverAddress);
    if (!isValidUrl) {
      setErrorText(`The address must follow a valid URL format`);
      setIsServerError(true);
      return;
    }

    try {
      // Check if Server is on before connecting
      await checkServer(serverAddress);

      const newSocket = io.connect(serverAddress);

      setSocket(newSocket);
      setUsername(newUsername);
      setServerUrl(serverAddress);
      getCurrentLocation();

      // If not undefined
      if (newSocket) {
        newSocket.on('connect', () => {
          console.log(`Connected to server at ${serverAddress}`);
          // 
          setIsConnected(true)
      
          newSocket.emit('login', {
            login:{
              username: `${newUsername}`,
              location: `${geoLocation}`,
              serverAddress: `${serverAddress}`,
            }
          });

          // getCurrentLocation();
        });
            
      }
    } catch (error) {
      setIsServerError(true);
      setErrorText(`Error connecting to server: Please ensure you entered a valid running server address.`);
      console.error('Error connecting to server:', error);
    }
    
        
  };

  // Functon to check if the server is running before connecting to it
  const checkServer = (serverAddress) => {
    return new Promise((resolve, reject) => {
      const socket = io(serverAddress);
      socket.on('connect', () => {
        socket.disconnect();
        resolve();
      });
      socket.on('connect_error', (error) => {
        setIsServerError(true);
        setErrorText(`Error: Could not connect to this address. Make sure the server is running first.`);
        socket.disconnect();
        reject(error);
      });
    });
  };


  // Function to get Geolocation
  const getCurrentLocation = () =>{
    if (navigator.geolocation) {
      // Get the user's current position
      navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          // console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
          setGeoLocation(`${latitude}, ${longitude}`);
        }, (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.error("User denied the request for Geolocation.");
              setGeoLocation('unknown location.')
              break;
            case error.POSITION_UNAVAILABLE:
              console.error("Location information is unavailable.");
              setGeoLocation('unknown location.')
              break;
            case error.TIMEOUT:
              console.error("The request to get user location timed out.");
              setGeoLocation('unknown location.')
              break;
            case error.UNKNOWN_ERROR:
              console.error("An unknown error occurred.");
              setGeoLocation('unknown location.')
              break;
            default:
              console.error("An unknown error occurred.");
              setGeoLocation('unknown location.')
          }
        });
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
}

  return (
    <div className="App">
      
      {socket ? (
        <Chat socket={socket} username={username} serverAddress={serverUrl} />
      ) : (
        <LoginForm onLogin={handleLogin} isServerError={isServerError} errorText={errorText}/>
      )}
    </div>
  );
}

export default App;