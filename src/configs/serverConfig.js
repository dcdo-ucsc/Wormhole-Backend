const path = require("path");

/* Environment variables */
module.exports = {
  SIZE_LIMIT: 3, // Per-file size limit (MB)
  MAX_FILE_COUNT: 3,  // Per-session file count limit
  // Uploads will be stored in the 'uploads' folder in the root directory
  SESSION_PATH: path.join(__dirname, "../../sessions")
};
