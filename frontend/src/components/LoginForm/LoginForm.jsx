import React from 'react';
import { useState, useEffect } from 'react';

import './LoginForm.css';

const LoginForm = ({ onLogin, isServerError, errorText }) => {
    const [serverAddress, setServerAddress] = useState('');
    const [nickname, setNickname] = useState('');

    const handleServerAddressChange = (event) => {
        setServerAddress(event.target.value);
    };

    const handleNicknameChange = (event) => {
        setNickname(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onLogin(serverAddress, nickname);
    };


  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Join the Chat</h2>
      <div className="form-group">
        <label htmlFor="server-address">Server Address:</label>
        <input type="text" id="server-address" value={serverAddress} onChange={handleServerAddressChange} required placeholder='Eg. http://localhost:8080' />
        <p id='error-server-address' hidden={isServerError ? false: true} style={{color: 'red', marginTop: 0}}>{errorText}</p>
      </div>
      <div className="form-group">
        <label htmlFor="nickname">Nickname:</label>
        <input type="text" id="nickname" value={nickname} onChange={handleNicknameChange} required placeholder='A nickname to identify you with' />
        <p id='error-nickname' hidden style={{color: 'red', marginTop: 0}}></p>
      </div>
      <button type="submit">Connect</button>
    </form>
  )
}

export default LoginForm