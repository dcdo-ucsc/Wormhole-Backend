const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const app = express();

const port = 3000; // Ensure this port is different from the frontend port

app.use(express.static('build')); // Serve static files from the React build directory
app.use(fileUpload());

app.use(cors({
  origin: 'http://localhost:5173' // Allow only the frontend URL
}));

// Create a directory for session files if it doesn't exist
const sessionsDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir);
}

// Endpoint to create a new session
app.get('/session', (req, res) => {
  console.log('Session acquired.')
  const sessionId = crypto.randomBytes(16).toString('hex');
  const sessionDir = path.join(sessionsDir, sessionId);

  fs.mkdirSync(sessionDir); // Create a directory for the session

  res.json({ sessionId });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});