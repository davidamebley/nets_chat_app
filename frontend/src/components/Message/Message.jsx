import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './Message.css';

function Message(props) {
  const { username, message, isCurrentUser } = props;

  const messageClassNames = classNames('message', {
    'current-user': isCurrentUser,
  });

  return (
    <div className={messageClassNames}>
      <div className="username">{username}</div>
      <div className="message-text">{message}</div>
    </div>
  );
}

Message.propTypes = {
  username: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  isCurrentUser: PropTypes.bool.isRequired,
};

export default Message;