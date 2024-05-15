// server.js

const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 5000;
const db = new sqlite3.Database('files.db');

app.use(express.json());

// Define the redirect URI for Dropbox OAuth callback
const REDIRECT_URI = 'http://localhost:5000/auth/dropbox/callback';

// Route to initiate Dropbox OAuth flow
app.get('/auth/dropbox', (req, res) => {
  res.redirect(`https://www.dropbox.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=${REDIRECT_URI}&response_type=code`);
});

// Route to handle OAuth callback from Dropbox
app.get('/auth/dropbox/callback', async (req, res) => {
  const code = req.query.code;
  const clientId = 'YOUR_CLIENT_ID';
  const clientSecret = 'YOUR_CLIENT_SECRET';

  try {
    const response = await axios.post('https://api.dropboxapi.com/oauth2/token', {
      code,
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI
    });

    // Save access token to database
    const accessToken = response.data.access_token;
    db.run('INSERT INTO tokens (access_token) VALUES (?)', [accessToken], (err) => {
      if (err) console.error(err);
      else console.log('Token saved to DB');
    });

    res.send('Success! You can now close this window.');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error occurred.');
  }
});

// Endpoint to save files to database
app.post('/files', (req, res) => {
  const files = req.body.files;
  // Assuming files table has columns: id, name, created_date, etc.
  db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY, name TEXT, created_date TEXT)');
    const stmt = db.prepare('INSERT INTO files (name, created_date) VALUES (?, ?)');
    files.forEach(file => {
      stmt.run(file.name, file.created_date);
    });
    stmt.finalize();
  });

  res.send('Files saved to DB');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
