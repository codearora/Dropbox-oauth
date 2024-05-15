// src/App.js
import React from 'react';
import axios from 'axios';
import DropboxConnect from './components/DropboxConnect';

const App = () => {
  const handleChoose = async (files) => {
    try {
      // Save files to database
      await axios.post('http://localhost:5000/files', { files });
      console.log('Files saved to DB');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleConnect = () => {
    window.location.href = 'http://localhost:5000/auth/dropbox';
  };

  return (
    <div>
      <DropboxConnect onChoose={handleChoose} />
      <button onClick={handleConnect}>Connect to Dropbox</button>
    </div>
  );
};

export default App;
