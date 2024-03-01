const jwt = require("jsonwebtoken");
const { isValidSessionEntry } = require("../helpers/sessionValidation");

/**
 * token Authentication for upload & download
 */
const authIsUser = async (req, res) => {
  const SECRET_KEY = process.env.SECRET_KEY;
  const authHeader = req.headers["authorization"];
  const accessToken = authHeader && authHeader.split(" ")[1];

  // Check if the token is present
  if (!accessToken) {
    return res.status(401).json({
      error: "Unauthorized: Access token not found. Format: Bearer <token>",
    });
  }

  // token info is in the payload
  return new Promise((resolve, reject) => {
    jwt.verify(accessToken, SECRET_KEY, async (err, payload) => {
      if (err) {
        return res.status(401).json({ message: "Token has expired" });
      }
      const sessionId = payload.sessionId;

      // save session to req object to be used for rest of the route
      req.session = await isValidSessionEntry(res, sessionId);
      if (!req.session) return;

      resolve(payload);
    });
  });
};

module.exports = { authIsUser };
