const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const agenda = require("../utils/agenda");
const {
  SESSION_PATH,
  JWT_DOWNLOAD_AUTH_EXPIRY,
} = require("../configs/serverConfig");
const {
  isValidSessionIdFormat,
  isValidSessionEntry,
  isValidUUIDv4,
} = require("../helpers/sessionValidation");
const { isAuthenticated } = require("../middlewares/downloadMiddleware");

const Session = require("../models/Session");

const router = express.Router();

const QRCode = require("qrcode");

/** Endpoint to create a new session, scheduled for deletion after a certain time
 *
 *  @name POST /api/session
 *
 * */
router.post("/create", async (req, res) => {
  const userId = req.cookies.userId;
  const deletionTime = Date.now() + Number(req.body.expiry);

  // Validate uuidv4 user format
  if (!isValidUUIDv4(res, userId)) return;

  // Create entry in MongoDB
  const newSession = new Session({
    userId,
    deletionTime,
    files: [],
  });

  // SessionId is generated by MongoDB (using ObjectId)
  const sessionId = newSession._id.toString();
  const sessionDir = path.join(SESSION_PATH, sessionId);
  newSession.directory = sessionDir; // Save to db
  fs.mkdirSync(sessionDir); // Create a directory for the session

  // If password is provided, hash it and save to db
  if (req.body.password && req.body.password !== "") {
    newSession.password = await bcrypt.hash(req.body.password, 10);
  }

  // Save the session to MongoDB
  await newSession.save();

  // Schedule deletion of session
  const expiresIn = Math.floor((deletionTime - Date.now()) / 1000);
  try {
    agenda.schedule(deletionTime, "delete session", {
      sessionDir,
      sessionId,
    });
  } catch (err) {
    console.error("Error scheduling deletion: ", err);
    return res.status(500).json({ error: "Error scheduling deletion" });
  }

  // Generate the QR code URL for this session
  const sessionUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/session/${sessionId}`;

  // Generate a QR code
  QRCode.toDataURL(sessionUrl, function (err, qrCodeDataURL) {
    if (err) {
      console.error("Error generating QR code:", err);
      return res.status(500).json({ error: "Error generating QR code" });
    }

    // Create an access token for the session
    const accessToken = jwt.sign(
      { sessionId, userId },
      process.env.SECRET_KEY,
      {
        expiresIn,
      }
    );

    /* Set cookie for the session Owner
      name: token_<sessionId>
      val : accessToken
    */
    res.cookie(`token_${sessionId}`, accessToken, {
      // httpOnly: true,
      maxAge: req.body.expiry,
    });

    // Respond with session info, including the QR code data URL and expiration time
    res.json({
      sessionId,
      accessToken,
      qrCodeDataURL,
      deletionTime,
    });
  });
});

const mongoose = require("mongoose");

router.get("/data/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    // Fetch session from the database using the session ID
    const sessionData = await Session.findById(sessionId);

    // Check if the session exists
    if (!sessionData) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Generate the QR code URL for this session
    const sessionUrl = `${req.protocol}://${req.get("host")}/api/session/${sessionId}`;

    // Generate a QR code
    QRCode.toDataURL(sessionUrl, function (err, qrCodeDataURL) {
      if (err) {
        console.error("Error generating QR code:", err);
        return res.status(500).json({ error: "Error generating QR code" });
      }

      const deletionTime = sessionData.deletionTime;

      // Respond with session info, including QR code data URL and calculated deletion time
      res.json({
        sessionId: sessionData._id,
        qrCodeDataURL,
        deletionTime,
        // Include any other session details you want to return
      });
    });
  } catch (error) {
    console.error("Error fetching session data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * Link for QR code. When the user creates the session, the front-end
 * should create the link for the QR code given the sessionId from sessionCreate.
 *
 * returns the sessionId & password status
 */
router.get("/:sessionId", async (req, res) => {
  const sessionId = req.params.sessionId;

  if (!isValidSessionIdFormat(res, sessionId)) return;

  const session = await isValidSessionEntry(res, sessionId);
  if (!session) return;

  // Generate the QR code URL again for this session
  const sessionUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/session/${sessionId}`;
  QRCode.toDataURL(sessionUrl, function (err, qrCodeDataURL) {
    if (err) {
      console.error("Error generating QR code:", err);
      return res.status(500).json({ error: "Error generating QR code" });
    }

    // Respond with session info, including the QR code data URL
    res.json({
      sessionId,
      qrCodeDataURL,
      deletionTime: session.deletionTime,
      password: session.password != null,
    });
  });
});

/**
 * The user will be given a token if they enter the correct password.
 * This should only be called if user isn't the owner of the session.
 *
 * check password
 * send 200 res & send auth token
 */
router.post("/auth", async (req, res) => {
  // const userId = req.body.userId;
  const sessionId = req.body.sessionId;

  // if (!isValidUUIDv4(res, userId)) return;
  if (!isValidSessionIdFormat(res, sessionId)) return;

  const session = await isValidSessionEntry(res, sessionId);
  if (!session) return;

  // check if session is protected by a password
  if (session.password != null) {
    // check if the user has provided a password
    if (req.body.password == null) {
      return res.status(401).json({
        error: "You don't have permission to access this file on this server.",
      });
    }
    // check if password is correct
    if (!(await bcrypt.compare(req.body.password, session.password))) {
      return res.status(401).json({
        error: "Invalid password",
      });
    }
  }

  const accessToken = jwt.sign({ sessionId }, process.env.SECRET_KEY, {
    expiresIn: JWT_DOWNLOAD_AUTH_EXPIRY,
  });

  /* Set cookie for the user
     name: token_<sessionId>
     val : accessToken
  */
  res.cookie(`token_${sessionId}`, accessToken, {
    // httpOnly: true,
    maxAge: req.body.expiry,
  });

  res.json({ accessToken });
});

/**
 * Retrieve the files associated with the session
 *
 */
router.get("/getFiles", isAuthenticated, async (req, res) => {
  const sessionId = req.payload.sessionId;

  // Retrieve the session from the database
  const session = await Session.findById(sessionId);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  // check if there are files in the session
  if (session.files.length === 0) {
    return res.status(404).json({
      error: "No files found in this session",
    });
  }

  // Send the files associated with the session back to the client
  res.json(session.files);
});

module.exports = router;
