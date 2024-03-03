require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const agenda = require("./src/utils/agenda");
const bodyParser = require("body-parser");
const fs = require("fs");

const { SESSION_PATH } = require("./src/configs/serverConfig");

const userRouter = require("./src/routes/user");
const sessionRouter = require("./src/routes/session");
const fileRouter = require("./src/routes/files");

// DEV - Agenda dashboard (for monitoring tasks)
let Agendash = require("agendash");
app.use("/dash", Agendash(agenda));

const port = process.env.PORT || 9001;

if (!process.env.SECRET_KEY) {
  console.error('No SECRET_KEY environment variable found');
  process.exit(1);
}

// Database connection
mongoose.connect(process.env.DATABASE_URL);

app.use(
  cors({
    origin: "http://localhost:5173", // Allow only the frontend URL
    credentials: true, // Allow cookies to be sent from the frontend
  })
);

// start Task scheduler
(async function () {
  await agenda.start();
})();

/* Middlewares */
app.use(bodyParser.json());
app.use(cookieParser());
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
app.use("/api/user", userRouter);
app.use("/api/session", sessionRouter);
app.use("/api/files", fileRouter);

// Home
app.get("/", (req, res) => {
  res.send("WormHole API home");
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
