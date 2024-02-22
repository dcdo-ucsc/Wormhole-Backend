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

app.use(
  cors({
    origin: "http://localhost:5173", // Allow only the frontend URL
  })
);

// start Task scheduler 
(async function () {
  await agenda.start();
})();

/* Middlewares */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Error handling
app.use(function (err, req, res, next) {
  if (err) {
    res.status(500).json({ error: err.message });
  } else {
    next();
  }
});

/* Routes */
app.use("/home", home);
app.use("/api/session", sessionRouter);
app.use("/api/files", fileRouter);

// Home
app.get("/", (req, res) => {
  res.send("Welcome to the File Upload API");
});

// Create a directory for session files if it doesn't exist
if (!fs.existsSync(SESSION_PATH)) {
  fs.mkdirSync(SESSION_PATH);
}

// Connection
app.listen(port, () => {
  console.log(`Server is running on port '${port}'`);
});

module.exports = app;
