const path = require("path");

/* Environment variables */
module.exports = {
  SIZE_LIMIT: 3, // Per-file size limit (MB)
<<<<<<< HEAD
  MAX_FILE_COUNT: 3,  // Per-session file count limit
  // Uploads will be stored in the 'uploads' folder in the root directory
  SESSION_PATH: path.join(__dirname, "../../sessions")
=======
  MAX_FILE_COUNT: 3, // Per-session file count limit
  SESSION_PATH: path.join(__dirname, "../../sessions"),
  JWT_DOWNLOAD_AUTH_EXPIRY: "1h",
  UUID_EXPIRY: 1000 * 60 * 60 * 24 * 30, // 30 days
>>>>>>> 4f765a4b92c97fa78598ab0b8938fe2b6b84d66c
};
