const mongoose = require("mongoose");
const Session = require("../models/Session");
const fs = require("fs");
const { MAX_FILE_COUNT } = require("../configs/serverConfig");

/**
 * Checks if the session Id format complies with MongoDB's ObjectId format.
 * sends a 400 response if the format is invalid.
 * 
 * @param {string} sessionId
 * @returns true if the session Id format is valid and false otherwise
 */
const isValidSessionIdFormat = (res, sessionId) => {
  // check if session Id format is valid
  if (mongoose.Types.ObjectId.isValid(sessionId) === false) {
    res.status(400).json({ error: "Invalid session ID format" });
    return false;
  }
  return true;
};

/**
 * Check if the session exists within MongoDB
 * @param {string} sessionId
 * @returns the session document, otherwise return false, response is
 *          sent outside of the function using: if(!session)
 */
const isValidSessionEntry = async (res, sessionId) => {
  try {
    const session = await Session.findById({ _id: sessionId });
    if (session === null) {
      res.status(400).json({ error: "Session not found" });
      return false;
    } else {
      return session;
    }
  } catch (err) {
    res.status(500).json({ error: err });
    return false;
  }
};

/**
 * check if # of files in session exceeds limit
 * */
const isFileCountExceeded = async (req, res, sessionId) => {
  const session = await Session.findById({ _id: sessionId });
  const sessionCount = session.totalFiles;
  const totalFiles = sessionCount + Number(req.query.fileCount); // Total files after upload
  const allowedFiles = MAX_FILE_COUNT - sessionCount; // File count after upload

  if (sessionCount >= MAX_FILE_COUNT) {
    res.status(413).json({ error: "Maximum # of file in session exceeded" });
    return true;
  }

  // check if file count after upload exceeds limit
  if (totalFiles > MAX_FILE_COUNT) {
    res
      .status(413)
      .json({ error: `You can only upload ${allowedFiles} file(s)` });
    return true;
  }
  return false;
};

const isValidUUIDv4 = (res, uuid) => {
  const uuidv4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidv4Regex.test(uuid)) {
    res.status(400).json({ error: "Invalid user ID format" });
    return false;
  }
  return true;
};

module.exports = {
  isValidSessionIdFormat,
  isValidSessionEntry,
  isFileCountExceeded,
  isValidUUIDv4,
};
