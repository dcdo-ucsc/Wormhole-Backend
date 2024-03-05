const jwt = require("jsonwebtoken");
const { isValidUUIDv4 } = require("../helpers/sessionValidation");
const Session = require("../models/Session");

/**
 * Middleware to authenticate the user's token
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log(authHeader);
  const accessToken = authHeader && authHeader.split(" ")[1];
  // Check if the token is present
  if (!accessToken) {
    return res.status(401).json({
      error: "Unauthorized: Access token not found. Format: Bearer <token>",
    });
  }

  jwt.verify(accessToken, process.env.SECRET_KEY, (err, payload) => {
    if (err) {
      return res.sendStatus(403);
    }

    // Check if the payload has the sessionId
    if (!payload.sessionId) {
      return res
        .status(403)
        .json({ error: "Token does not include sessionId" });
    }

    // save the payload to the req object
    req.payload = payload;
    next();
  });
};

/**
 *
 * check token for download
 * (only getting the sessionID) no matter the user is the owner or not
 * The owner token has userId field in the payload, but the user token doesn't
 *
 */
// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (token == null) {
//     return res.sendStatus(401);
//   }

//   jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
//     if (err) {
//       return res.sendStatus(403);
//     }

//     // Check if the payload has the sessionId
//     if (!payload.sessionId) {
//       return res.status(403).json({ error: 'Token does not include sessionId' });
//     }

//     // The payload from the token is attached to the req object
//     req.payload = payload;
//     next();
//   });
// }

module.exports = { authenticateToken };
