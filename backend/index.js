const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const fetch = require('isomorphic-fetch');
const Dropbox = require('dropbox').Dropbox;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

// SQLite database setup
const db = new sqlite3.Database('database.db', (err) => {
    if (err) {
        console.error('Error opening database: ', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Create 'tokens' table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            access_token TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creating tokens table: ', err.message);
            } else {
                console.log('Tokens table created successfully.');
            }
        });
    }
});

// Dropbox API credentials
const CLIENT_ID = '-';
const CLIENT_SECRET = '-';
const REDIRECT_URI = 'http://localhost:5000/auth/dropbox/callback';

// Route to initiate the Dropbox OAuth flow
app.get('/auth/dropbox', (req, res) => {
    const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    res.redirect(authUrl);
});

// Route to handle OAuth callback from Dropbox
app.get('/auth/dropbox/callback', async (req, res) => {
    const code = req.query.code;

    // Exchange code for access token
    const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            code: code,
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
        }),
    });

    const data = await response.json();
    const accessToken = data.access_token;

    // Store access token in SQLite database
    db.run(`INSERT INTO tokens (access_token) VALUES (?)`, [accessToken], (err) => {
        if (err) {
            console.error('Error storing access token: ', err.message);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Access token stored successfully.');
            res.redirect('/files');
        }
    });
});

// Route to fetch files from Dropbox
// Route to fetch files from Dropbox
app.get('/files', (req, res) => {
    db.all(`SELECT * FROM tokens ORDER BY id DESC LIMIT 1`, (err, rows) => {
        if (err) {
            console.error('Error fetching access token: ', err.message);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (rows.length === 0) {
            console.error('No access token found in the database.');
            res.status(404).send('No Access Token Found');
            return;
        }

        const accessToken = rows[0].access_token;
        const dbx = new Dropbox({ accessToken });
        dbx.filesListFolder({ path: '' })
            .then((response) => {
                res.json(response.result.entries);
            })
            .catch((error) => {
                console.error('Error fetching files from Dropbox: ', error);
                res.status(500).send('Internal Server Error');
            });
    });
});


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
