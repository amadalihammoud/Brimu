import React from 'react';
import LoginSimple from './LoginSimple';

const Auth = ({ onLogin }) => {
  return (
    <LoginSimple onLogin={onLogin} />
  );
};

export default Auth;