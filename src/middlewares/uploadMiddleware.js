const {
  isFileCountExceeded,
} = require("../helpers/sessionValidation");
const { authIsUser } = require("../middlewares/authMiddleware");

/**
 * Middleware to authenticate the user's token
 */
const authIsAdmin = async (req, res, next) => {
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
};

// Middleware for checking session / file upload
const validateUpload = async (req, res, next) => {
  const sessionId = req.payload.sessionId;

  if (await isFileCountExceeded(req, res, sessionId)) return;

  next();
};

module.exports = { validateUpload, authIsAdmin };
