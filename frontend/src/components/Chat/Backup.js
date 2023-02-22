/*** First Backup
 * 
 * import React, { useState, useEffect } from 'react';
import './Chat.css';

const Chat = ({ socket, username }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    socket.on('message', (data) => {
      // Append new message to the chat history
      const newMessage = JSON.parse(data)
      setChatHistory((prevHistory) => [...prevHistory, newMessage]);
    });

    socket.on('login', (data) => {
      // Append login notification to the chat history
      const newMessage = JSON.parse(data)
      setChatHistory((prevHistory) => [...prevHistory, newMessage]);
    });

    return () => {
      // Make sure to clean up any event listeners when the component unmounts
      socket.off('message');
      socket.off('login');
    };
  }, [socket]);

  const handleMessageSubmit = (event) => {
    event.preventDefault();

    // Only send non-empty messages
    if (message.trim() !== '') {
      const userId = socket.id;
      const newMessage = {
        message: {
          userId: userId,
          text: `${username}: ${message}`
        }
      }
      // Send message to the server
      socket.emit('message', newMessage);
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <h1 className="chat-header">Chat</h1>
      <ul className="chat-history">
        {chatHistory.map((entry, index) => (
          <li key={index} className="chat-message">{entry.message.text}</li>
        ))}
      </ul>
      <form onSubmit={handleMessageSubmit} className="chat-form">
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="chat-input"
        />
        <button type="submit" className="chat-submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
 */



// Second Backup
/* 
import React, { useState, useEffect } from 'react';
import './Chat.css';

const Chat = ({ socket, username }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    socket.on('message', (data) => {
      // Append new message to the chat history
      const newMessage = JSON.parse(data)
      setChatHistory((prevHistory) => [...prevHistory, newMessage]);
    });

    socket.on('login', (data) => {
      // Append login notification to the chat history
      const newMessage = JSON.parse(data)
      setChatHistory((prevHistory) => [...prevHistory, newMessage]);
    });

    return () => {
      // Make sure to clean up any event listeners when the component unmounts
      socket.off('message');
      socket.off('login');
    };
  }, [socket]);

  const handleMessageSubmit = (event) => {
    event.preventDefault();

    // Only send non-empty messages
    if (message.trim() !== '') {
      const userId = socket.id;
      const newMessage = {
        message: {
          userId: userId,
          text: `${username}: ${message}`
        }
      }
      // Send message to the server
      socket.emit('message', newMessage);
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <h1 className="chat-header">Chat</h1>
      <ul className="chat-history">
        {chatHistory.map((entry, index) => (
          <li 
            key={index} 
            className={
              entry.type === 'login'
                  ? 'login-notification'
                  : entry.message.userId === socket.id
                  ? 'chat-message chat-message-right'
                  : 'chat-message chat-message-left'
            }
          >
            {entry.message.text}
          </li>
        ))}
      </ul>
      <form onSubmit={handleMessageSubmit} className="chat-form">
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="chat-input"
        />
        <button type="submit" className="chat-submit-btn">Send</button>
      </form>
    </div>
  );
}

export default Chat;


*THIRD BACKUP


*/