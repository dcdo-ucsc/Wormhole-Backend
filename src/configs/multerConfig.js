const multer = require("multer");
const path = require("path");
const { PayloadTooLargeException } = require("../constants/errors");

const { SIZE_LIMIT, SESSION_PATH, MAX_FILE_COUNT } = require("./serverConfig");

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const sessionId = req.payload.sessionId;
    const dir = path.join(SESSION_PATH, sessionId);

    cb(null, dir);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: SIZE_LIMIT * 1024 * 1024, // MiB
    files: MAX_FILE_COUNT,
  },
});

// Middleware to handle errors
const multerErrorHandler = (err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: `File size of ${SIZE_LIMIT}MB limit exceeded.`,
    });
  // } else if (err.code === "LIMIT_FILE_COUNT") {
  //   return res.status(413).json({ error: "File count limit exceeded" });
  } else {
    next(err);
  }
};

module.exports = { upload, multerErrorHandler };
