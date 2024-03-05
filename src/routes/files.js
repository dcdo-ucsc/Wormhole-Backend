const express = require("express");
const fs = require("fs");
const archiver = require("archiver");
const sanitize = require("sanitize-filename");
const path = require("path");
const { upload, multerErrorHandler } = require("../configs/multerConfig");
const { isValidSessionEntry } = require("../helpers/sessionValidation");
const { dupeCheck, fileExist } = require("../utils/fileValidator");
<<<<<<< HEAD
const { authenticateToken } = require("../middlewares/sessionMiddleware");
const { validateUpload, authIsAdmin } = require("../middlewares/uploadMiddleware");
=======
const {
  validateUpload,
  authIsAdmin,
} = require("../middlewares/uploadMiddleware");
const { isAuthenticated } = require("../middlewares/downloadMiddleware");
>>>>>>> 4f765a4b92c97fa78598ab0b8938fe2b6b84d66c

const Session = require("../models/Session");

const router = express.Router();

router.get("/", (req, res) => {
<<<<<<< HEAD
  res.send("Hello from files API!");
=======
  res.send("Files API home");
>>>>>>> 4f765a4b92c97fa78598ab0b8938fe2b6b84d66c
});

/**
 * We need to verify is the user is the owner of the session
<<<<<<< HEAD
=======
 * 
 * http://localhost:9001/api/files/upload?fileCount={{fileCount}}   <-- this is the postman url i used
 * 
 * fileCount is in the param bc multer doesn't give us the file count
 * without it uploading partial files into the session. I'm too lazy to fix it.
 * it works for now
>>>>>>> 4f765a4b92c97fa78598ab0b8938fe2b6b84d66c
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

<<<<<<< HEAD
    // const sessionId = req.params.sessionId;
=======
>>>>>>> 4f765a4b92c97fa78598ab0b8938fe2b6b84d66c
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

<<<<<<< HEAD
router.get("/download/:sessionId", async (req, res) => {
  const sessionId = req.params.sessionId;
  const archive = archiver("zip");

  const session = await isValidSessionEntry(res, sessionId);
=======
router.get("/download/:sessionId", isAuthenticated, async (req, res) => {
  const archive = archiver("zip");
  const session = req.session;
>>>>>>> 4f765a4b92c97fa78598ab0b8938fe2b6b84d66c

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
<<<<<<< HEAD
  } else {
=======
    return;

  } else if (session.files.length == 1) {
>>>>>>> 4f765a4b92c97fa78598ab0b8938fe2b6b84d66c
    // download the file if there's only one
    const file = session.files[0];
    const filePath = path.join(session.directory, file.fileName);

    if (!fileExist(filePath, res)) return;

    res.download(filePath, file.originalName);
<<<<<<< HEAD
  }
});

router.get("/preview", authenticateToken, async (req, res) => {
  const sessionId = req.payload.sessionId;
  const session = await isValidSessionEntry(res, sessionId);
=======
    return;
  }
  // No files found
  return res.status(404).json({ error: "No files found" });
});

router.get("/preview", isAuthenticated, async (req, res) => {
  const sessionId = req.payload.sessionId;
  const session = await isValidSessionEntry(res, sessionId);
  if (!session) return;
>>>>>>> 4f765a4b92c97fa78598ab0b8938fe2b6b84d66c

  if (session.files.length > 1) {
    // For multiple files, you might want to send a list of file names or some other summary data
    // because it's not practical to preview multiple files at once
<<<<<<< HEAD
    const fileNames = session.files.map(file => file.originalName);
=======
    const fileNames = session.files.map((file) => file.originalName);
>>>>>>> 4f765a4b92c97fa78598ab0b8938fe2b6b84d66c
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
