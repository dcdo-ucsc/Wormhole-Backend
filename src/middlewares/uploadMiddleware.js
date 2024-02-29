const jwt = require("jsonwebtoken");
const {
  isValidSessionIdFormat,
  isValidSessionEntry,
  isFileCountExceeded,
} = require("../helpers/sessionValidation");

/**
 * Middleware to authenticate the user's token
 */
const authIsAdmin = async (req, res, next) => {
  const SECRET_KEY = process.env.SECRET_KEY;
  const authHeader = req.headers["authorization"];
  const accessToken = authHeader && authHeader.split(" ")[1];
  
  // Check if the token is present
  if (!accessToken) {
    return res.status(401).json({
      error: "Unauthorized: Access token not found. Format: Bearer <token>",
    });
  }

  jwt.verify(accessToken, SECRET_KEY, async (err, payload) => {
    if (err) {
      return res.sendStatus(403);
    }
    const sessionId = payload.sessionId;

    // save session to req object to be used for rest of the route
    req.session = await isValidSessionEntry(res, sessionId);
    if (!req.session) return;

    // Check if the payload has the userId & if they're the owner of the session
    if (!payload.userId || payload.userId !== req.session.userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Not the owner of session" });
    }

    // save the payload to the req object
    req.payload = payload;
    next();
  });
};

// Middleware for checking session / file upload
const validateUpload = async (req, res, next) => {
  const sessionId = req.payload.sessionId;
  
  if (await isFileCountExceeded(req, res, sessionId)) return;

  next();
};

module.exports = { validateUpload, authIsAdmin };
