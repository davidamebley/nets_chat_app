import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

const Chat = ({ socket, username }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const chatHistoryRef = useRef(null);
  const chatInputRef = useRef(null);
  const typingStatusElement = document.getElementById('typing-status')
  let typingTimerId;

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
      // socket.off('logout');
    };
  }, [socket]);

  useEffect(() => {
    // Scroll to the bottom of the chat history
    const container = document.querySelector('.app-container');
    container.scrollTop = container.scrollHeight;
  }, [chatHistory]);

  useEffect(() => {
    //Listen to Typing event
    const textBoxElement = document.getElementById('text-box');
    textBoxElement.addEventListener('input', (event) => {
      socket.emit('userTyping', username);

      clearTimeout(typingTimerId);  //cancel timeout as user keeps typing
      typingTimerId = setTimeout(() => {
        // User stopped typing
        socket.emit('userStoppedTyping', username); //trigger timeout when user stops typing for a while
      }, 500);

    });
    // Listen for typing event broadcast from server
    socket.on('userTypingBroadcast', (username)=>{
      typingStatusElement.innerText = `${username} is typing...`
    });

    // Listen for typing stopped event broadcast from server
    socket.on('userStoppedTypingBroadcast', ()=>{
      typingStatusElement.innerText = '';
    });
  }, []);

  /* useEffect(() => {
    socket.on('logout', (data) => {
      // Append login notification to the chat history
      const newMessage = JSON.parse(data)
      console.log(newMessage)
      setChatHistory((prevHistory) => [...prevHistory, newMessage]);
      console.log(chatHistory)
    });
  }, [socket]) */
  
  
  

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
      chatInputRef.current.focus();
    }
  };

  return (
    <div className='app-container'>
      <h1 className="chat-header">Chat</h1>
      <div className="chat-container">
        
        <ul className="chat-history">
          {chatHistory.map((entry, index) => (
            <li 
              key={index} 
              className={
                entry.type === 'login' || entry.type === 'logout'
                    ? 'notification'
                    : entry.message.userId === socket.id
                    ? 'chat-message chat-message-right'
                    : 'chat-message chat-message-left'
              }
            >
              <div className='chat-message-text'>
                {entry.message.text}
              </div>
            </li>
          ))}
        </ul>

        <div className="chat-input-container">
          <form onSubmit={handleMessageSubmit} className="chat-form">
            <p id='typing-status' ></p>
            <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
              <input
              id='text-box'
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Type a message..."
                className="chat-input"
                ref={chatInputRef}
              />
              <button type="submit" className="chat-submit-button">Send</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;