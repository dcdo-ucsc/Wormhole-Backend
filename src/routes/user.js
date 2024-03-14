const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { UUID_EXPIRY } = require('../configs/serverConfig');
const { verifyJwtToken } =  require('../helpers/jwtHelper');

router.get('/generate', async (req, res, next) => {
  // Check if the userId exists
  let userId = req.cookies.userId;

  // If the userId does not exist, generate a new UUID and set it as a cookie
  if (!userId) {
    userId = uuidv4();
    res.cookie('userId', userId, {
      maxAge: UUID_EXPIRY,
    });
  }
  res.json({ userId });
});

/**
 *
 * If the token doesn't contain 'userId', then it is a user,
 * otherwise its the owner
 */
router.get('/fetchRole', async (req, res, next) => {
  const payload = await verifyJwtToken(req, res);

  // If the token doesn't contain 'userId', then it is a user
  if (!payload.userId) {
    return res.status(200).json({ userRole: 'user' });
  }

  // Otherwise its the owner
  return res.status(200).json({ userRole: 'owner' });
});

module.exports = router;
