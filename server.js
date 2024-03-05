require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const agenda = require("./src/utils/agenda");
const bodyParser = require("body-parser");
const fs = require("fs");

const { SESSION_PATH } = require("./src/configs/serverConfig");

const fileRouter = require("./src/routes/files");
const sessionRouter = require("./src/routes/session");
const home = require("./src/routes/home");

// DEV - Agenda dashboard (for monitoring tasks)
let Agendash = require("agendash");
app.use("/dash", Agendash(agenda));

const port = process.env.PORT;

// Database connection
mongoose.connect(process.env.DATABASE_URL);
require('dotenv').config();

// Connect to MongoDB using the DATABASE_URL from .env file
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connection successful'))
  .catch(err => console.error('MongoDB connection error:', err));

// To handle initial connection errors, you can listen to the 'error' event on mongoose.connection:
mongoose.connection.on('error', err => {
  console.error('Mongoose initial connection error:', err);
});

app.use(cors({
  origin: 'http://localhost:5173' // Allow only the frontend URL
}));

// Create a directory for session files if it doesn't exist
if (!fs.existsSync(SESSION_PATH)) {
  fs.mkdirSync(SESSION_PATH);
}

// Connection
app.listen(port, () => {
  console.log(`Server is running on port '${port}'`);
});

module.exports = app;
