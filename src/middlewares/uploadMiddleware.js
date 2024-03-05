<<<<<<< HEAD
const jwt = require("jsonwebtoken");
const {
  isValidSessionIdFormat,
  isValidSessionEntry,
  isFileCountExceeded,
} = require("../helpers/sessionValidation");
=======
const {
  isFileCountExceeded,
} = require("../helpers/sessionValidation");
const { authIsUser } = require("../middlewares/authMiddleware");
>>>>>>> 4f765a4b92c97fa78598ab0b8938fe2b6b84d66c

/**
 * Middleware to authenticate the user's token
 */
const authIsAdmin = async (req, res, next) => {
<<<<<<< HEAD
  const authHeader = req.headers["authorization"];
  console.log(authHeader);
  const accessToken = authHeader && authHeader.split(" ")[1];
  // Check if the token is present
  if (!accessToken) {
    return res.status(401).json({
      error: "Unauthorized: Access token not found. Format: Bearer <token>",
    });
  }

  jwt.verify(accessToken, process.env.SECRET_KEY, async (err, payload) => {
    if (err) {
      return res.sendStatus(403);
    }
    const sessionId = payload.sessionId;

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
=======
  const payload = await authIsUser(req, res);
  // check if user is the owner of the session
  if (!payload.userId || payload.userId !== req.session.userId) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Not the owner of session" });
  }

  // save the payload to the req object
  req.payload = payload;
  next();
>>>>>>> 4f765a4b92c97fa78598ab0b8938fe2b6b84d66c
};

// Middleware for checking session / file upload
const validateUpload = async (req, res, next) => {
  const sessionId = req.payload.sessionId;
<<<<<<< HEAD
  // save session to req object to be used for rest of the route
  req.session = await isValidSessionEntry(res, sessionId);
  if (!req.session) return;

  if (await isFileCountExceeded(res, sessionId)) return;
=======

  if (await isFileCountExceeded(req, res, sessionId)) return;
>>>>>>> 4f765a4b92c97fa78598ab0b8938fe2b6b84d66c

  next();
};

module.exports = { validateUpload, authIsAdmin };
