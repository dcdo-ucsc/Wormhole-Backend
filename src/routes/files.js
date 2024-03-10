const express = require("express");
const fs = require("fs");
const archiver = require("archiver");
const sanitize = require("sanitize-filename");
const path = require("path");
const { upload, multerErrorHandler } = require("../configs/multerConfig");
const { isValidSessionEntry } = require("../helpers/sessionValidation");
const { dupeCheck, fileExist } = require("../utils/fileValidator");
const {
  validateUpload,
  authIsAdmin,
} = require("../middlewares/uploadMiddleware");
const { isAuthenticated } = require("../middlewares/downloadMiddleware");

const Session = require("../models/Session");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Files API home");
});

/**
 * We need to verify is the user is the owner of the session
 *
 */
router.post(
  "/upload",
  authIsAdmin,
  validateUpload,
  upload.array("file"),
  multerErrorHandler,
  async (req, res) => {
    // Check if the file is present
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("Please upload a file.");
    }

    const sessionId = req.payload.sessionId;

    const session = await Session.findOne({ _id: sessionId });

    // Get file info from request
    req.files.forEach((file) => {
      const sanitized = sanitize(file.originalname);
      session.totalSize += file.size;
      session.totalFiles++;

      session.files.push({
        originalName: sanitized,
        fileName: file.filename,
        mimeType: file.mimetype,
        fileSize: file.size,
      });
    });

    await session.save();

    // Send the response
    res.status(200).json({
      File: `Uploaded successfully.`,
    });
  }
);

router.get("/download", isAuthenticated, async (req, res) => {
  const archive = archiver("zip");
  const session = req.session;

  // Set the header
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  
  session.downloadCount++;
  await session.save();

  // zip files if are more than one, otherwise download the file
  if (session.files.length > 1) {
    // map to check for duplicate file names
    const fileMap = new Map();
    session.files.forEach((file) => {
      const filePath = path.join(session.directory, file.fileName);

      if (!fileExist(filePath, res)) return;

      const fileName = dupeCheck(file.originalName, fileMap);
      archive.file(filePath, { name: fileName });
    });

    // attach the zip file to the response & send it
    res.attachment("files.zip");
    archive.pipe(res);
    archive.finalize();
    return;

  } else if (session.files.length == 1) {
    // download the file if there's only one
    const file = session.files[0];
    const filePath = path.join(session.directory, file.fileName);

    if (!fileExist(filePath, res)) return;

    res.download(filePath, file.originalName);
    return;
  }
  // No files found
  return res.status(404).json({ error: "No files found" });
});

router.get("/preview", isAuthenticated, async (req, res) => {
  const sessionId = req.payload.sessionId;
  const session = await isValidSessionEntry(res, sessionId);
  if (!session) return;

  if (session.files.length > 1) {
    // For multiple files, you might want to send a list of file names or some other summary data
    // because it's not practical to preview multiple files at once
    const fileNames = session.files.map((file) => file.originalName);
    res.json(fileNames);
  } else {
    // For a single file, you can send the file data for preview
    const file = session.files[0];
    const filePath = path.join(session.directory, file.fileName);

    if (!fileExist(filePath, res)) return;

    // Create a read stream and pipe it to the response
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  }
});

module.exports = router;
