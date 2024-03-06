require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const agenda = require("./src/utils/agenda");
const bodyParser = require("body-parser");
const fs = require("fs");

const connectDB = require("./db");
const { SESSION_PATH } = require("./src/configs/serverConfig");

const userRouter = require("./src/routes/user");
const fileRouter = require("./src/routes/files");
const sessionRouter = require("./src/routes/session");
const home = require("./src/routes/home");

// DEV - Agenda dashboard (for monitoring tasks)
let Agendash = require("agendash");
app.use("/dash", Agendash(agenda));

const port = process.env.PORT;

// Database connection
connectDB();

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
app.use("/home", home);
app.use("/api/user", userRouter);
app.use("/api/session", sessionRouter);
app.use("/api/files", fileRouter);
app.use("/assets", express.static(path.join(__dirname, "dist", "assets")));

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
app.get("/session", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
app.get("/join", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
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
