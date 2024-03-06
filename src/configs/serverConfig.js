const path = require("path");

/* Environment variables */
module.exports = {
  SIZE_LIMIT: 3, // Per-file size limit (MB)
  MAX_FILE_COUNT: 3, // Per-session file count limit
  SESSION_PATH: path.join(__dirname, "../../sessions"),
  JWT_DOWNLOAD_AUTH_EXPIRY: "1h",
  UUID_EXPIRY: 1000 * 60 * 60 * 24 * 30, // 30 days
};
