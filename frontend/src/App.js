import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/files');
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files: ', error);
    }
  };

  const handleConnectDropbox = async () => {
    try {
      // Redirect to backend server to initiate OAuth flow with Dropbox
      window.location.href = 'http://localhost:5000/auth/dropbox';
    } catch (error) {
      console.error('Error connecting to Dropbox: ', error);
    }
  };

  return (
    <div className="App">
      <h1>Dropbox Files</h1>
      <button onClick={handleConnectDropbox}>Connect to Dropbox</button>
      <ul>
        {files.map((file) => (
          <li key={file.id}>
            <strong>{file.name}</strong> - {file.size} bytes
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
