import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

const Chat = ({ socket, username }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [textBoxElement, setTextBoxElement] = useState(null)
  const chatInputRef = useRef(null);
  let typingTimerId;

  useEffect(() => {
    // Create rep of textbox element
    setTextBoxElement(chatInputRef.current);

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

    socket.on('logout', (data) => {
      // Append logout notification to the chat history
      const newMessage = JSON.parse(data)
      setChatHistory((prevHistory) => [...prevHistory, newMessage]);
    });

    return () => {
      // Make sure to clean up any event listeners when the component unmounts
      socket.off('message');
      socket.off('login');
      socket.off('logout');
      // socket.emit('userLeftChat', username); // notify server that user has left chat
    };
  }, [socket]);
  

  useEffect(() => {
    // Scroll to the bottom of the chat history
    const container = document.querySelector('.app-container');
    container.scrollTop = container.scrollHeight;
  }, [chatHistory]);

  useEffect(() => {
    //Listen to Typing event
    const typingStatusElement = document.getElementById('typing-status')
    
    // Handle textbox input/typing changes
    const handleInput = (event) => {
        socket.emit('userTyping', username);
  
        clearTimeout(typingTimerId);  //cancel timeout as user keeps typing
        typingTimerId = setTimeout(() => {
          // User stopped typing
          socket.emit('userStoppedTyping', username); //trigger timeout when user stops typing for a while
        }, 500);
      };

    // Add event listener
    textBoxElement?.addEventListener('input', handleInput);

    // Listen for typing event broadcast from server
    socket.on('userTypingBroadcast', (username)=>{
      if (typingStatusElement) {
        typingStatusElement.innerHTML = `<i>${username} is typing...</i>`;
      }
    });

    // Listen for typing stopped event broadcast from server
    socket.on('userStoppedTypingBroadcast', ()=>{
      if (typingStatusElement) {
        typingStatusElement.innerText = '';
      }
    });

    // Remove event listener when component unmounts
    return () => {
      textBoxElement?.removeEventListener('input', handleInput);
    };

  }, [chatInputRef.current]);
  

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
                {entry.message.userId === socket.id ? (
                  // Display the message without the sender's name
                  entry.message.text.substring(entry.message.text.indexOf(':') + 1).trim()
                ) : (
                  // Display the message with the sender's name highlighted
                  <>
                    <span style={{ color: '#DC143C', fontSize:'0.8rem' }}>
                      {entry.message.text.substring(0, entry.message.text.indexOf(':'))}
                    </span>{' '}
                    {entry.message.text.substring(entry.message.text.indexOf(':') + 1).trim()}
                  </>
                )}
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