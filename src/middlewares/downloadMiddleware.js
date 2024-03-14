const { verifyJwtToken } = require('../helpers/jwtHelper');

/**
 * Check if user is allowed to download from session
 * checks if sessionId matches the one stored in sessionToken
 */
const isAuthenticated = async (req, res, next) => {
  const payload = await verifyJwtToken(req, res);

  // check if the sessionId within the token matches 
  // the provided sessionId in the request
  if (payload.sessionId !== req.query.sessionId) {
    return res
      .status(401)
      .json({ error: "Unauthorized: You don't have access to this session" });
  }

  // save the payload to be used in the remaining request
  req.payload = payload;
  next();
};

module.exports = { isAuthenticated };
