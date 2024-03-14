const { isFileCountExceeded } = require('../helpers/sessionValidation');
const { verifyJwtToken } = require('../helpers/jwtHelper');

/**
 * Checks if the user is the owner of the session
 * 
 * Used only for the upload endpoint (owner of the session)
 * Only the session owner has the userId in the token payload
 *
 */
const authIsOwner = async (req, res, next) => {
  const payload = await verifyJwtToken(req, res);
  // check if user is the owner of the session using the userId
  if (!payload.userId || payload.userId !== req.session.userId) {
    return res
      .status(401)
      .json({ error: 'Unauthorized: Not the owner of session' });
  }

  // save the payload to the req object
  req.payload = payload;
  next();
};

// checks the session before uploading files
const validateUpload = async (req, res, next) => {
  const sessionId = req.payload.sessionId;

  if (await isFileCountExceeded(req, res, sessionId)) return;

  next();
};

module.exports = { validateUpload, authIsOwner };
