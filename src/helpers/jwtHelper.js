const jwt = require('jsonwebtoken');
const { isValidSessionEntry } = require('./sessionValidation');

/**
 * checks if:
 *  - the token is present in the request header
 *  - checks if the token has expired
 * 
 * `req.session` is set to the session object
 * 
 *  returns the payload if the token is valid
 */
const verifyJwtToken = async (req, res) => {
  const SECRET_KEY = process.env.SECRET_KEY;
  const authHeader = req.headers['authorization'];
  // Get the token from the header <Bearer token>
  const accessToken = authHeader && authHeader.split(' ')[1];

  // Check if the token is present
  if (!accessToken) {
    return res.status(401).json({
      error: 'Unauthorized: Access token not found. Format: Bearer <token>',
    });
  }

  // token info is in the payload
  return new Promise((resolve, reject) => {
    // payload is what's stored in the token
    jwt.verify(accessToken, SECRET_KEY, async (err, payload) => {
      if (err) {
        return res.status(401).json({ error: 'AccessToken is missing' });
      }
      // get the sessionId from the token payload
      const sessionId = payload.sessionId;

      // save session to req object to be used for rest of the request
      req.session = await isValidSessionEntry(res, sessionId);
      if (!req.session) return;

      resolve(payload);
    });
  });
};

module.exports = { verifyJwtToken };
