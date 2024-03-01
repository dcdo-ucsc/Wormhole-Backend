const jwt = require("jsonwebtoken");
const { authIsUser } = require("../middlewares/authMiddleware");

/**
 * Check if user is allowed to download from session
 */
const isAuthenticated = async (req, res, next) => {
  const payload = await authIsUser(req, res);

  // check if sessionId's match from the token and the request
  if (payload.sessionId !== req.params.sessionId) {
    return res
      .status(401)
      .json({ error: "Unauthorized: You don't have access to this session" });
  }

  // save the payload to the req object
  req.payload = payload;
  next();
};

module.exports = { isAuthenticated };
